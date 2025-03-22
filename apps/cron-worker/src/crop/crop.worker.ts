import { CropJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { CropCurrentState, InjectMongoose, PlacedItemSchema, PlacedItemType } from "@src/databases"
import { Job } from "bullmq"
import { DateUtcService } from "@src/date"
import { CoreService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"
import { SchemaStatus, WithStatus } from "@src/common"
@Processor(bullData[BullQueueName.Crop].name)
export class CropWorker extends WorkerHost {
    private readonly logger = new Logger(CropWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        private readonly syncService: SyncService,
        private readonly dateUtcService: DateUtcService,
        private readonly coreService: CoreService,
        private readonly staticService: StaticService
    ) {
        super()
    }

    public override async process(job: Job<CropJobData>): Promise<void> {
        try {
            this.logger.verbose(`Processing job: ${job.id}`)
            const { time, skip, take, utcTime } = job.data

            const placedItemTypes = this.staticService.placedItemTypes.filter(
                (placedItemType) => placedItemType.type === PlacedItemType.Tile
            )
            // if the owner is currently on tutorial, skip the crop growth
            const { growthStages } = this.staticService.cropInfo

            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    placedItemType: {
                        $in: placedItemTypes.map((placedItemType) => placedItemType.id)
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
            const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
            for (const placedItem of placedItems) {
                const promise = async () => {
                    try {
                        const crop = this.staticService.crops.find(
                            (crop) => crop.id === placedItem.seedGrowthInfo.crop.toString()
                        )
                        const placedItemType = this.staticService.placedItemTypes.find(
                            (placedItemType) =>
                                placedItem.placedItemType.toString() === placedItemType.id.toString()
                        )
                        if (!placedItemType) {
                            throw new Error("Placed item type not found")
                        }
                        const tile = this.staticService.tiles.find(
                            (tile) => tile.id.toString() === placedItemType.tile.toString()
                        )
                        // Add time to the seed growth
                        // if
                        const updatePlacedItem = (): boolean => {
                        // return if the current stage is already max stage
                            if (placedItem.seedGrowthInfo.currentStage >= growthStages - 1) {
                                return false
                            }
                            // add time to the seed growth
                            placedItem.seedGrowthInfo.currentStageTimeElapsed += time
                            if (
                                placedItem.seedGrowthInfo.currentStageTimeElapsed <
                            crop.growthStageDuration
                            ) {
                                return false
                            }
                            
                            // deduct the time elapsed from the current stage time elapsed
                            placedItem.seedGrowthInfo.currentStageTimeElapsed -=
                            crop.growthStageDuration
                            // increment the current stage
                            placedItem.seedGrowthInfo.currentStage += 1
                            //reset fertilizer after
                            placedItem.seedGrowthInfo.isFertilized = false

                            // if the current stage is less than max stage - 3, check if need water
                            if (placedItem.seedGrowthInfo.currentStage <= growthStages - 3) {
                                if (Math.random() < needWater) {
                                    placedItem.seedGrowthInfo.currentState = CropCurrentState.NeedWater
                                }
                                placedItem.seedGrowthInfo.currentStageTimeElapsed = 0
                                return true
                            }

                            // if the current stage is max stage - 2, check if weedy or infested
                            if (placedItem.seedGrowthInfo.currentStage === growthStages - 2) {
                                if (Math.random() < isWeedyOrInfested) {
                                    if (Math.random() < 0.5) {
                                        placedItem.seedGrowthInfo.currentState =
                                        CropCurrentState.IsWeedy
                                    } else {
                                        placedItem.seedGrowthInfo.currentState =
                                        CropCurrentState.IsInfested
                                    }
                                }
                                return true
                            }
                            // else, the crop is fully matured
                            if (
                                placedItem.seedGrowthInfo.currentState ===
                                CropCurrentState.IsInfested ||
                            placedItem.seedGrowthInfo.currentState === CropCurrentState.IsWeedy
                            ) {
                                placedItem.seedGrowthInfo.harvestQuantityRemaining = Math.floor(
                                    (crop.minHarvestQuantity + crop.maxHarvestQuantity) / 2
                                )
                            } else {
                                placedItem.seedGrowthInfo.harvestQuantityRemaining =
                                crop.maxHarvestQuantity
                            }
                            const chance = this.coreService.computeTileQualityChance({
                                placedItemTile: placedItem,
                                tile: tile
                            })
                            if (Math.random() < chance) {
                                placedItem.seedGrowthInfo.isQuality = true
                            }
                            placedItem.seedGrowthInfo.currentState = CropCurrentState.FullyMatured
                            return true
                        }
                        // update the placed item
                        const synced = updatePlacedItem()
                        await placedItem.save()
                        if (synced) {
                            const updatedSyncedPlacedItems =
                                this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                                    placedItems: [placedItem],
                                    status: SchemaStatus.Updated
                                })
                            syncedPlacedItems.push(...updatedSyncedPlacedItems)
                            await this.kafkaProducer.send({
                                topic: KafkaTopic.SyncPlacedItems,
                                messages: [
                                    {
                                        value: JSON.stringify({
                                            userId: placedItem.user.toString(),
                                            placedItems: updatedSyncedPlacedItems
                                        })
                                    }
                                ]
                            })
                        }
                    } catch (error) {
                        this.logger.error(error)
                    }
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } catch (error) {
            this.logger.error(error)
        }
    }
}
