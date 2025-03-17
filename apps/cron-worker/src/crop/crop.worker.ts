import { CropJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import {
    CropCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
} from "@src/databases"
import { Job } from "bullmq"
import { DateUtcService } from "@src/date"
import { CoreService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Crop].name)
export class CropWorker extends WorkerHost {
    private readonly logger = new Logger(CropWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly coreService: CoreService,
        private readonly staticService: StaticService
    ) {
        super()
    }

    public override async process(job: Job<CropJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data

        // const placedItemTypes = await this.connection
        //     .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
        //     .find({
        //         type: PlacedItemType.Tile
        //     })

        const placedItemTypes = this.staticService.placedItemTypes.filter(
            (placedItemType) => placedItemType.type === PlacedItemType.Tile
        )
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                placedItemType: {
                    $in: placedItemTypes.map((placedItemType) => placedItemType.id),
                },
                seedGrowthInfo: {
                    $ne: null
                },
                "seedGrowthInfo.currentState": {
                    $nin: [CropCurrentState.NeedWater, CropCurrentState.FullyMatured]
                },
                createdAt: {
                    $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                }
            })
            .skip(skip)
            .limit(take) 
            .sort({ createdAt: "desc" }) 
        const { needWater, isWeedyOrInfested } = this.staticService.cropInfo.randomness
        const promises: Array<Promise<void>> = []
        for (const placedItem of placedItems) {
            const promise = async () => {
                const mongoSession = await this.connection.startSession()
                try {
                    const placedItemType = this.staticService.placedItemTypes.find(placedItemType => placedItem.placedItemType.toString() === placedItemType.id)
                    const crop = this.staticService.crops.find(crop => crop.id === placedItem.seedGrowthInfo.crop.toString())
                    const tile = this.staticService.tiles.find(tile => tile.id === placedItem.tileInfo.toString()) 
                    // Add time to the seed growth
                    const updatePlacedItem = () => {
                        // return if the current stage is already max stage
                        if (
                            placedItem.seedGrowthInfo.currentStage >= crop.growthStages - 1
                        ) {
                            return
                        }
                        // add time to the seed growth
                        placedItem.seedGrowthInfo.currentStageTimeElapsed += time
                        if (
                            placedItem.seedGrowthInfo.currentStageTimeElapsed <
                                crop.growthStageDuration
                        ) {
                            return
                        }
                        // deduct the time elapsed from the current stage time elapsed
                        placedItem.seedGrowthInfo.currentStageTimeElapsed -=
                                crop.growthStageDuration
                        // increment the current stage
                        placedItem.seedGrowthInfo.currentStage += 1
                        //reset fertilizer after
                        placedItem.seedGrowthInfo.isFertilized = false

                        // if the current stage is less than max stage - 3, check if need water
                        if (placedItem.seedGrowthInfo.currentStage <= crop.growthStages - 3) {
                            if (Math.random() < needWater) {
                                placedItem.seedGrowthInfo.currentState =
                                        CropCurrentState.NeedWater
                            }
                            placedItem.seedGrowthInfo.currentStageTimeElapsed = 0
                            return
                        }

                        // if the current stage is max stage - 2, check if weedy or infested
                        if (placedItem.seedGrowthInfo.currentStage === crop.growthStages - 2) {
                            if (Math.random() < isWeedyOrInfested) {
                                if (Math.random() < 0.5) {
                                    placedItem.seedGrowthInfo.currentState =
                                            CropCurrentState.IsWeedy
                                } else {
                                    placedItem.seedGrowthInfo.currentState =
                                            CropCurrentState.IsInfested
                                }
                            }
                            return
                        }
                        // else, the crop is fully matured
                        if (
                            placedItem.seedGrowthInfo.currentState ===
                                    CropCurrentState.IsInfested ||
                                placedItem.seedGrowthInfo.currentState === CropCurrentState.IsWeedy
                        ) {
                            placedItem.seedGrowthInfo.harvestQuantityRemaining =
                                    Math.floor((crop.minHarvestQuantity + crop.maxHarvestQuantity) / 2)
                        } else {
                            placedItem.seedGrowthInfo.harvestQuantityRemaining =
                                    crop.maxHarvestQuantity
                        }
                        const chance = this.coreService.computeTileQualityChance({
                            tileInfo: placedItem.tileInfo,
                            qualityProductChanceLimit: tile.qualityProductChanceLimit,
                            qualityProductChanceStack: tile.qualityProductChanceStack
                        })
                        if (Math.random() < chance) {
                            placedItem.seedGrowthInfo.isQuality = true
                        }
                        placedItem.seedGrowthInfo.currentState = CropCurrentState.FullyMatured
                        return
                    }
                    // update the placed item
                    updatePlacedItem()
                    await placedItem.save({ session })
                } catch (error) {
                    this.logger.error(error)
                } finally {
                    await session.endSession()
                }
            }
            promises.push(promise())
        }
        await Promise.all(promises)
    }
}
