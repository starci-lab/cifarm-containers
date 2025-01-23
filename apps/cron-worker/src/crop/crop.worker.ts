import { CropJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import {
    CropCurrentState,
    CropRandomness,
    InjectPostgreSQL,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId
} from "@src/databases"
import { Job } from "bullmq"
import { DataSource, LessThanOrEqual, Not } from "typeorm"
import { DateUtcService } from "@src/date"

@Processor(bullData[BullQueueName.Crop].name)
export class CropWorker extends WorkerHost {
    private readonly logger = new Logger(CropWorker.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService
    ) {
        super()
    }

    public override async process(job: Job<CropJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            let seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
                where: {
                    currentState:
                        Not(CropCurrentState.NeedWater) && Not(CropCurrentState.FullyMatured),
                    createdAt: LessThanOrEqual(this.dateUtcService.getDayjs(utcTime).toDate())
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
                seedGrowthInfo.currentStageTimeElapsed += time

                //while the current stage time elapsed is greater than the growth stage duration
                while (
                    seedGrowthInfo.currentStageTimeElapsed >=
                        seedGrowthInfo.crop.growthStageDuration &&
                    seedGrowthInfo.currentStage <= seedGrowthInfo.crop.growthStages - 1
                ) {
                    seedGrowthInfo.currentStageTimeElapsed -=
                        seedGrowthInfo.crop.growthStageDuration
                    seedGrowthInfo.currentStage += 1
                    //reset fertilizer after
                    seedGrowthInfo.isFertilized = false

                    if (seedGrowthInfo.currentStage <= seedGrowthInfo.crop.growthStages - 3) {
                        if (Math.random() < needWater) {
                            seedGrowthInfo.currentState = CropCurrentState.NeedWater
                        }
                    }
                    if (seedGrowthInfo.currentStage === seedGrowthInfo.crop.growthStages - 2) {
                        if (Math.random() < isWeedyOrInfested) {
                            if (Math.random() < 0.5) {
                                seedGrowthInfo.currentState = CropCurrentState.IsWeedy
                            } else {
                                seedGrowthInfo.currentState = CropCurrentState.IsInfested
                            }
                        }
                    }
                }

                if (seedGrowthInfo.currentStage === seedGrowthInfo.crop.growthStages - 1) {
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
                throw error
            }
        } finally {
            await queryRunner.release()
        }
    }
}
