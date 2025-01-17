import {
    AnimalEntity,
    AnimalId,
    BuildingId,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { BuyAnimalService } from "./buy-animal.service"
import { BuyAnimalModule } from "./buy-animal.module"

describe("BuyAnimalService", () => {
    let dataSource: DataSource
    let service: BuyAnimalService
    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [BuyAnimalModule]
        })
        dataSource = ds
        service = module.get<BuyAnimalService>(BuyAnimalService)
    })

    it("Should construct a building and successfully buy animals for it", async () => {
        const buildingId = BuildingId.Pasture
        const animalId = AnimalId.Cow

        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        const userBeforeWorkflow = await queryRunner.manager.save(UserEntity, mockUser)

        const placedItem: DeepPartial<PlacedItemEntity> = {
            userId: userBeforeWorkflow.id,
            x: 0,
            y: 0,
            buildingInfo: {
                buildingId: buildingId,
                occupancy: 0,
                currentUpgrade: 0,
                placedItem: {
                    x: 0,
                    y: 0
                }
            },
            placedItemType: {
                id: PlacedItemTypeId.Pasture,
                type: PlacedItemType.Building
            }
        }

        const placedItemBuilding: PlacedItemEntity = await queryRunner.manager.save(PlacedItemEntity, placedItem)

        await queryRunner.startTransaction()

        try {
            // Verify building was constructed
            const placedBuilding = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: placedItemBuilding.id, userId: userBeforeWorkflow.id },
                relations: { buildingInfo: true }
            })

            expect(placedBuilding).toBeDefined()
            expect(placedBuilding.buildingInfo.buildingId).toBe(buildingId)

            // Step 2: Buy animals for the constructed building
            const animal = await queryRunner.manager.findOneOrFail(AnimalEntity, {
                where: { id: AnimalId.Cow, availableInShop: true }
            })

            const buyAnimalRequest: BuyAnimalRequest = {
                animalId: animalId,
                userId: userBeforeWorkflow.id,
                placedItemBuildingId: placedItemBuilding.id,
                position: { x: 10, y: 10 },
            }

            await service.buyAnimal(buyAnimalRequest)

            // Verify animal was bought
            const placedAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { userId: userBeforeWorkflow.id, animalInfo: { animalId: animal.id } },
                relations: { animalInfo: true }
            })

            expect(placedAnimal).toBeDefined()
            expect(placedAnimal.animalInfo.animalId).toBe(animal.id)

            // Verify building occupancy
            const updatedBuilding = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: placedItemBuilding.id },
                relations: { buildingInfo: true }
            })

            expect(updatedBuilding.buildingInfo.occupancy).toBe(1)

            // Commit transaction
            await queryRunner.commitTransaction()
        } catch (error) {
            // Rollback transaction in case of error
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
            await queryRunner.manager.remove(UserEntity, mockUser)
        } finally {
            await queryRunner.release()
        }
    })
})
