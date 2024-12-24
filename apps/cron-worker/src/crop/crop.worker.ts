import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { DataSource, LessThanOrEqual, Not } from "typeorm"
import {
    CropCurrentState,
    CropRandomness,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId
} from "@src/database"
import { CropsWorkerProcessTransactionFailedException } from "@src/exceptions"
import { bullConfig, BullQueueName } from "@src/config"
import { CropJobData } from "@apps/cron-scheduler"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

@Processor(bullConfig[BullQueueName.Crop].name)
export class CropWorker extends WorkerHost {
    private readonly logger = new Logger(CropWorker.name)

    constructor(private readonly dataSource: DataSource) {
        super()
    }

    public override async process(job: Job<CropJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { growthTime, skip, take, utcTime } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
                where: {
                    currentState: Not(CropCurrentState.NeedWater) && Not(CropCurrentState.FullyMatured),
                    createdAt: LessThanOrEqual(dayjs(utcTime).toDate())
                },
                relations: {
                    crop: true
                },
                skip,
                take,
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
            seedGrowthInfos = seedGrowthInfos.map((seedGrowthInfo) => {
                // Add time to the seed growth
                seedGrowthInfo.currentStageTimeElapsed += growthTime
                seedGrowthInfo.totalTimeElapsed += growthTime

                //while the current stage time elapsed is greater than the growth stage duration
                while (
                    seedGrowthInfo.currentStageTimeElapsed >=
                        seedGrowthInfo.crop.growthStageDuration &&
                    seedGrowthInfo.currentStage <= seedGrowthInfo.crop.growthStages
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

                if (seedGrowthInfo.currentStage === seedGrowthInfo.crop.growthStages) {
                    if (
                        seedGrowthInfo.currentState === CropCurrentState.IsInfested ||
                        seedGrowthInfo.currentState === CropCurrentState.IsWeedy
                    ) {
                        seedGrowthInfo.harvestQuantityRemaining =
                            (seedGrowthInfo.crop.minHarvestQuantity +
                                seedGrowthInfo.crop.maxHarvestQuantity) /
                            2
                    }
                    seedGrowthInfo.currentState = CropCurrentState.FullyMatured
                }
                return seedGrowthInfo
            })

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(SeedGrowthInfoEntity, seedGrowthInfos)
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new CropsWorkerProcessTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
