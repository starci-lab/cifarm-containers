import { AnimalCurrentState, AnimalId, AnimalInfoEntity, PlacedItemEntity, UserEntity } from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { CureAnimalRequest } from "./cure-animal.dto"
import { CureAnimalService } from "./cure-animal.service"

describe("CureAnimalService", () => {
    let dataSource: DataSource
    let service: CureAnimalService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 10,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [CureAnimalService],
        })
        dataSource = ds
        service = module.get<CureAnimalService>(CureAnimalService)
    })

    it("Should successfully cure a sick animal", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const user = await queryRunner.manager.save(UserEntity, mockUser)

            const placedItem = await queryRunner.manager.save(PlacedItemEntity, {
                userId: user.id,
                animalInfo: {
                    currentState: AnimalCurrentState.Sick,
                    animalId: AnimalId.Cow,
                },
            })

            const request: CureAnimalRequest = {
                userId: user.id,
                placedItemAnimalId: placedItem.id,
            }

            await queryRunner.startTransaction()

            try {
                // Execute the service method
                await service.cureAnimal(request)

                // Verify animal state updated
                const updatedAnimalInfo = await queryRunner.manager.findOne(AnimalInfoEntity, {
                    where: { id: placedItem.animalInfo.id },
                })
                expect(updatedAnimalInfo.currentState).toBe(AnimalCurrentState.Normal)

                // Verify user energy and experience updated
                const updatedUser = await queryRunner.manager.findOne(UserEntity, {
                    where: { id: user.id },
                })
                expect(updatedUser.energy).toBe(mockUser.energy - 5)
                expect(updatedUser.experiences).toBe(mockUser.experiences + 20)

                await queryRunner.commitTransaction()
            } catch (error) {
                await queryRunner.rollbackTransaction()
                throw error
            }
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, mockUser)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
