import {
    AnimalCurrentState,
    AnimalId,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    SupplyId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { FeedAnimalRequest } from "./feed-animal.dto"
import { FeedAnimalModule } from "./feed-animal.module"
import { FeedAnimalService } from "./feed-animal.service"

describe("FeedAnimalService", () => {
    let dataSource: DataSource
    let service: FeedAnimalService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 10,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [FeedAnimalModule],
        })
        dataSource = ds
        service = module.get<FeedAnimalService>(FeedAnimalService)
    })

    it("Should successfully feed a hungry animal", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            // Create mock user
            const user = await queryRunner.manager.save(UserEntity, mockUser)

            // Create mock placed item
            const placedItem = await queryRunner.manager.save(PlacedItemEntity, {
                userId: user.id,
                animalInfo: {
                    currentState: AnimalCurrentState.Hungry,
                    animalId: AnimalId.Cow,
                },
            })

            // Create mock inventory
            const inventoryType = await queryRunner.manager.save(InventoryEntity, {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Supply,
                    supplyId: SupplyId.AnimalFeed,
                },
                quantity: 5,
            })

            const request: FeedAnimalRequest = {
                userId: user.id,
                placedItemAnimalId: placedItem.id,
            }

            // Execute the service method
            const response = await service.feedAnimal(request)

            // Verify animal state updated
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: placedItem.id },
                relations: { animalInfo: true },
            })
            expect(placedItemAnimal.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
            expect(placedItemAnimal.animalInfo.currentHungryTime).toBe(0)

            // Verify user energy and experience updated
            const updatedUser = await queryRunner.manager.findOne(UserEntity, {
                where: { id: user.id },
            })
            expect(updatedUser.energy).toBe(mockUser.energy - 3)
            expect(updatedUser.experiences).toBe(mockUser.experiences + 10)

            // Verify inventory updated
            const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { id: inventoryType.id },
            })
            expect(updatedInventory.quantity).toBe(4)

            expect(response).toEqual({})
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, { id: mockUser.id })
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
