// npx jest apps/gameplay-service/src/farming/water/water.spec.ts

import {
    CropCurrentState,
    CropEntity,
    CropId,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    UserEntity
} from "@src/databases"
import {
    createTestModule,
    MOCK_USER,
} from "@src/testing/infra"
import {
    DataSource,
    DeepPartial,
} from "typeorm"
import { WaterRequest } from "./water.dto"
import { WaterModule } from "./water.module"
import { WaterService } from "./water.service"

describe("WaterService", () => {
    let dataSource: DataSource
    let service: WaterService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 50,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [WaterModule],
        })
        dataSource = ds
        service = module.get<WaterService>(WaterService)
    })

    it("Should successfully water crops that need water", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // Mock user and placed item with crop needing water
            const user = await queryRunner.manager.save(UserEntity, mockUser)

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
                    crop,
                    currentState: CropCurrentState.NeedWater,
                } as DeepPartial<SeedGrowthInfoEntity>,
            })

            const request: WaterRequest = {
                userId: user.id,
                placedItemTileId: placedItemTile.id,
            }

            await queryRunner.startTransaction()
            try {
                // Execute service
                const response = await service.water(request)

                // Verify seed growth info updated
                const updatedSeedGrowthInfo = await queryRunner.manager.findOne(SeedGrowthInfoEntity, {
                    where: { id: placedItemTile.seedGrowthInfo.id },
                })
                expect(updatedSeedGrowthInfo.currentState).toBe(CropCurrentState.Normal)

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
