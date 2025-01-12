// npx jest apps/gameplay-service/src/farming/use-fertilizer/use-fertilizer.spec.ts

import {
    CropEntity,
    CropId,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SupplyId,
    UserEntity
} from "@src/databases"
import {
    createTestModule,
    MOCK_USER,
} from "@src/testing"
import {
    DataSource,
    DeepPartial,
} from "typeorm"
import { UseFertilizerRequest } from "./use-fertilizer.dto"
import { UseFertilizerModule } from "./use-fertilizer.module"
import { UseFertilizerService } from "./use-fertilizer.service"

describe("UseFertilizerService", () => {
    let dataSource: DataSource
    let service: UseFertilizerService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 50,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [UseFertilizerModule],
        })
        dataSource = ds
        service = module.get<UseFertilizerService>(UseFertilizerService)
    })

    it("Should successfully use fertilizer", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Mock user, placed item, and seed growth info
            const user = await queryRunner.manager.save(UserEntity, mockUser)

            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    id: SupplyId.BasicFertilizer,
                    type: InventoryType.Supply,
                },
            })

            const inventory = await queryRunner.manager.save(InventoryEntity, {
                userId: user.id,
                inventoryType,
                quantity: 3,
            })

            const cropId = CropId.BellPepper
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: cropId },
            })

            const placedItemTile = await queryRunner.manager.save(PlacedItemEntity, {
                userId: user.id,
                x: 1,
                y: 1,
                seedGrowthInfo: {
                    currentStageTimeElapsed: 10,
                    isFertilized: false,
                    harvestQuantityRemaining: 0,
                    crop
                } as DeepPartial<SeedGrowthInfoEntity>,
            })

            const request: UseFertilizerRequest = {
                userId: user.id,
                placedItemTileId: placedItemTile.id,
            }

            await queryRunner.startTransaction()
            try {
                // Execute service
                const response = await service.useFertilizer(request)

                // Verify inventory updated
                const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
                    where: { id: inventory.id },
                })
                expect(updatedInventory.quantity).toBe(2)

                // Verify seed growth info updated
                const updatedSeedGrowthInfo = await queryRunner.manager.findOne(SeedGrowthInfoEntity, {
                    where: { id: placedItemTile.seedGrowthInfo.id },
                })
                expect(updatedSeedGrowthInfo.isFertilized).toBe(true)
                expect(updatedSeedGrowthInfo.currentStageTimeElapsed).toBe(30)

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
