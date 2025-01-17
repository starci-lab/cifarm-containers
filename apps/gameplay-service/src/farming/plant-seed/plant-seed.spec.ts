//npx jest apps/gameplay-service/src/farming/plant-seed/plant-seed.spec.ts

import {
    CropEntity,
    CropId,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { PlantSeedRequest } from "./plant-seed.dto"
import { PlantSeedModule } from "./plant-seed.module"
import { PlantSeedService } from "./plant-seed.service"

describe("PlantSeedService", () => {
    let dataSource: DataSource
    let service: PlantSeedService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 10,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [PlantSeedModule],
        })
        dataSource = ds
        service = module.get<PlantSeedService>(PlantSeedService)
    })

    it("Should successfully plant a seed", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Create mock user
            const user = await queryRunner.manager.save(UserEntity, mockUser)

            //Crop
            const cropId = CropId.Carrot
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: cropId },
            })

            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { 
                    type: InventoryType.Seed,
                    cropId: cropId
                },
            })


            // Create mock inventory
            const inventory = await queryRunner.manager.save(InventoryEntity, {
                userId: user.id,
                inventoryType, 
                quantity: 5,
            })

            // Create mock placed tile
            const placedItemTile = await queryRunner.manager.save(PlacedItemEntity, {
                userId: user.id,
                x: 1,
                y: 1,
            })


            const request: PlantSeedRequest = {
                userId: user.id,
                inventorySeedId: inventory.id,
                placedItemTileId: placedItemTile.id,
            }

            await queryRunner.startTransaction()

            try {
                // Execute the service method
                const response = await service.plantSeed(request)

                // Verify inventory updated
                const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
                    where: { id: inventory.id },
                })
                expect(updatedInventory.quantity).toBe(4)

                // Verify seed growth info created
                const seedGrowthInfo = await queryRunner.manager.findOne(SeedGrowthInfoEntity, {
                    where: { placedItemId: placedItemTile.id },
                })
                expect(seedGrowthInfo).toBeDefined()
                expect(seedGrowthInfo.cropId).toBe(crop.id)
                expect(seedGrowthInfo.harvestQuantityRemaining).toBe(crop.maxHarvestQuantity)

                expect(response).toEqual({})
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
