import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Inject, Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { DataSource, Not } from "typeorm"
import { CropsJobData, cropsTimeQueueConstants } from "@apps/cron-scheduler"
import {
    CropCurrentState,
    CropRandomness,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId
} from "@src/database"
import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager"
import { speedUpConstants } from "@apps/gameplay-service"

@Processor(cropsTimeQueueConstants.NAME)
export class CropsWorker extends WorkerHost {
    private readonly logger = new Logger(CropsWorker.name)

    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        private readonly dataSource: DataSource) {
        super()
    }

    public override async process(job: Job<CropsJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { from, to } = job.data

        //find the speed up cache
        const value = await this.cacheManager.get(speedUpConstants.KEY)
        let multiple = 1
        if (value) {
            // kieemr tra kieu du lieu xem redis luu string hay number
            multiple = Number(value)
            await this.cacheManager.del(speedUpConstants.KEY)
        }

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
                where: {
                    fullyMatured: false,
                    currentState: Not(CropCurrentState.NeedWater)
                },
                relations: {
                    crop: true
                },
                skip: from,
                take: to - from,
                order: {
                    createdAt: "ASC"
                }
            })
            const system = await queryRunner.manager.findOne(SystemEntity, {
                where: {
                    id: SystemId.CropRandomness
                }
            })
            const { needWater, isWeedyOrInfested } = system.value as CropRandomness
            try {
                await queryRunner.startTransaction()
                seedGrowthInfos = seedGrowthInfos.map((seedGrowthInfo) => {
                // Add time to the seed growth
                    seedGrowthInfo.currentStageTimeElapsed += multiple
                    seedGrowthInfo.totalTimeElapsed += multiple

                    //while the current stage time elapsed is greater than the growth stage duration
                    while (
                        seedGrowthInfo.currentStageTimeElapsed >=
                    seedGrowthInfo.crop.growthStageDuration
                    ) {
                        seedGrowthInfo.currentStageTimeElapsed -=
                        seedGrowthInfo.crop.growthStageDuration
                        seedGrowthInfo.currentStage += 1
                        //reset fertilizer after
                        seedGrowthInfo.isFertilized = false
                        if (seedGrowthInfo.currentStage <= seedGrowthInfo.crop.growthStages - 2) {
                            if (Math.random() < needWater) {
                                seedGrowthInfo.currentState = CropCurrentState.NeedWater
                            }
                        }
                        if (seedGrowthInfo.currentStage === seedGrowthInfo.crop.growthStages - 1) {
                            if (Math.random() < isWeedyOrInfested) {
                                if (Math.random() < 0.5) {
                                    seedGrowthInfo.currentState = CropCurrentState.IsWeedy
                                } else {
                                    seedGrowthInfo.currentState = CropCurrentState.IsInfested
                                }
                            }
                        }
                    }

                    if (seedGrowthInfo.currentStage >= seedGrowthInfo.crop.growthStages) {
                        if (
                            seedGrowthInfo.currentState === CropCurrentState.IsInfested ||
                        seedGrowthInfo.currentState === CropCurrentState.IsWeedy
                        ) {
                            seedGrowthInfo.harvestQuantityRemaining =
                            (seedGrowthInfo.crop.minHarvestQuantity +
                                seedGrowthInfo.crop.maxHarvestQuantity) /
                            2
                        }
                        seedGrowthInfo.fullyMatured = true
                    }
                    return seedGrowthInfo
                })
                await queryRunner.manager.save(SeedGrowthInfoEntity, seedGrowthInfos)
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(error)
                await queryRunner.rollbackTransaction()
            }
        } finally {
            await queryRunner.release()
        }
    }
}
