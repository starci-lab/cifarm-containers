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
import { DataSource, DeepPartial, LessThanOrEqual, Not } from "typeorm"
import { DateUtcService } from "@src/date"
import { ProductService } from "@src/gameplay"
import { getDifferenceAndValues } from "@src/common"
import { isEmpty } from "lodash"

@Processor(bullData[BullQueueName.Crop].name)
export class CropWorker extends WorkerHost {
    private readonly logger = new Logger(CropWorker.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService,
        private readonly productService: ProductService
    ) {
        super()
    }

    public override async process(job: Job<CropJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const seedGrowthInfos = await queryRunner.manager.find(SeedGrowthInfoEntity, {
                where: {
                    currentState:
                        Not(CropCurrentState.NeedWater) && Not(CropCurrentState.FullyMatured),
                    createdAt: LessThanOrEqual(this.dateUtcService.getDayjs(utcTime).toDate())
                },
                relations: {
                    crop: true,
                    placedItem: {
                        placedItemType: {
                            tile: true
                        },
                        tileInfo: true
                    }
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

            const promises: Array<Promise<void>> = []

            for (const seedGrowthInfo of seedGrowthInfos) {
                const promise = async () => {
                    // Add time to the seed growth
                    const seedGrowthInfoChanges = (): DeepPartial<SeedGrowthInfoEntity> => {
                        const seedGrowthInfoBeforeChanges = { ...seedGrowthInfo }
                        // add time to the seed growth
                        seedGrowthInfo.currentStageTimeElapsed += time
                        if (
                            seedGrowthInfo.currentStageTimeElapsed <
                            seedGrowthInfo.crop.growthStageDuration
                        ) {
                            return getDifferenceAndValues(seedGrowthInfoBeforeChanges, seedGrowthInfo)
                        }
                        // deduct the time elapsed from the current stage time elapsed
                        seedGrowthInfo.currentStageTimeElapsed -= seedGrowthInfo.crop.growthStageDuration
                        // increment the current stage
                        seedGrowthInfo.currentStage += 1
                        //reset fertilizer after
                        seedGrowthInfo.isFertilized = false

                        // if the current stage is less than max stage - 3, check if need water
                        if (
                            seedGrowthInfo.currentStage <=
                                seedGrowthInfo.crop.growthStages - 3
                        ) {
                            if (Math.random() < needWater) {
                                seedGrowthInfo.currentState = CropCurrentState.NeedWater
                            }
                            return getDifferenceAndValues(seedGrowthInfoBeforeChanges, seedGrowthInfo)
                        }

                        // if the current stage is max stage - 2, check if weedy or infested
                        if (
                            seedGrowthInfo.currentStage ===
                                seedGrowthInfo.crop.growthStages - 2
                        ) {
                            if (Math.random() < isWeedyOrInfested) {
                                if (Math.random() < 0.5) {
                                    seedGrowthInfo.currentState = CropCurrentState.IsWeedy
                                } else {
                                    seedGrowthInfo.currentState = CropCurrentState.IsInfested
                                }
                            }
                            return getDifferenceAndValues(seedGrowthInfoBeforeChanges, seedGrowthInfo)
                        }

                        // else, the crop is fully matured
                        if (
                            seedGrowthInfo.currentState === CropCurrentState.IsInfested ||
                                seedGrowthInfo.currentState === CropCurrentState.IsWeedy
                        ) {
                            seedGrowthInfo.harvestQuantityRemaining =
                                    (seedGrowthInfo.crop.minHarvestQuantity +
                                        seedGrowthInfo.crop.maxHarvestQuantity) /
                                    2
                        } else {
                            seedGrowthInfo.harvestQuantityRemaining =
                                    seedGrowthInfo.crop.maxHarvestQuantity
                        }
                        const chance = this.productService.computeTileQualityChance({
                            entity: seedGrowthInfo.placedItem.tileInfo,
                            qualityProductChanceLimit:
                                    seedGrowthInfo.placedItem.placedItemType.tile
                                        .qualityProductChanceLimit,
                            qualityProductChanceStack:
                                    seedGrowthInfo.placedItem.placedItemType.tile
                                        .qualityProductChanceStack
                        })
                        if (Math.random() < chance) {
                            seedGrowthInfo.isQuality = true
                        }
                        seedGrowthInfo.currentState = CropCurrentState.FullyMatured
                        return getDifferenceAndValues(seedGrowthInfoBeforeChanges, seedGrowthInfo)
                    }

                    const changes = seedGrowthInfoChanges()
                    if (isEmpty(changes)) {
                        return
                    }
                    await queryRunner.startTransaction()
                    try {
                        await queryRunner.manager.update(
                            SeedGrowthInfoEntity,
                            seedGrowthInfo.id,
                            changes
                        )
                        await queryRunner.commitTransaction()
                    } catch (error) {
                        this.logger.error(`Transaction failed: ${error}`)
                        await queryRunner.rollbackTransaction()
                        throw error
                    }
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } finally {
            await queryRunner.release()
        }
    }
}
