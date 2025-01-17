//npx jest apps/gameplay-service/src/farming/harvest-crop/havest-crop.spec.ts

import {
    CropCurrentState,
    CropEntity,
    CropId,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    ProductId,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { HarvestCropRequest } from "./harvest-crop.dto"
import { HarvestCropService } from "./harvest-crop.service"
import { HarvestCropModule } from "./harvest-crop.module"

describe("HarvestCropService", () => {
    let dataSource: DataSource
    let service: HarvestCropService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 10,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [HarvestCropModule],
        })
        dataSource = ds
        service = module.get<HarvestCropService>(HarvestCropService)
    })

    it("Should successfully harvest a fully matured crop", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        // Create mock user
        const user = await queryRunner.manager.save(UserEntity, mockUser)

        const crop = await queryRunner.manager.findOne(CropEntity, {
            where: { id: CropId.Carrot },
        })

        const placedItem = await queryRunner.manager.save(PlacedItemEntity, {
            userId: user.id,
            x: 0,
            y: 0,
            seedGrowthInfo: {
                crop,
                currentState: CropCurrentState.FullyMatured,
                harvestQuantityRemaining: 5,
                currentPerennialCount: 0,
            }
        })


        await queryRunner.startTransaction()

        try {
            const request: HarvestCropRequest = {
                userId: user.id,
                placedItemTileId: placedItem.id,
            }

            // Execute the service method
            await service.harvestCrop(request)

            // Verify inventory updated
            const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { userId: user.id, inventoryType: {
                    id: ProductId.Carrot,
                    type: InventoryType.Product
                } },
            })
            expect(updatedInventory.quantity).toBe(5)

            // Verify seed growth info updated or removed
            const updatedSeedGrowthInfo = await queryRunner.manager.findOne(SeedGrowthInfoEntity, {
                where: { id: placedItem.seedGrowthInfo.id },
            })

            if (updatedSeedGrowthInfo) {
                expect(updatedSeedGrowthInfo.currentPerennialCount).toBe(1)
                expect(updatedSeedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
                expect(updatedSeedGrowthInfo.currentStageTimeElapsed).toBe(0)
            }

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
