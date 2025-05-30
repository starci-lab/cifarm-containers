import { CropJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { 
    PlantType,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    AbstractPlantSchema,
    PlantCurrentState
} from "@src/databases"
import { Job } from "bullmq"
import { DateUtcService } from "@src/date"
import { CoreService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"
import { WithStatus } from "@src/common"
import { SyncPlacedItemsPayload } from "@apps/ws"
import { envConfig } from "@src/env"
@Processor(bullData[BullQueueName.Plant].name)
export class PlantWorker extends WorkerHost {
    private readonly logger = new Logger(PlantWorker.name)

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
        if (job.timestamp && (Date.now() - job.timestamp) > envConfig().cron.timeout) {
            this.logger.warn(`Removed old job: ${job.id}`)
            return
        }
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
                    plantInfo: {
                        $ne: null
                    },
                    "plantInfo.currentState": {
                        $nin: [PlantCurrentState.NeedWater, PlantCurrentState.FullyMatured]
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
                const growthAcceleration = this.coreService.computeGrowthAcceleration({
                    growthAcceleration: placedItem.tileInfo.growthAcceleration
                })
                const qualityYield = this.coreService.computeQualityYield({
                    qualityYield: placedItem.tileInfo.qualityYield
                })
                const harvestYieldBonus = this.coreService.computeHarvestYieldBonus({
                    harvestYieldBonus: placedItem.tileInfo.harvestYieldBonus
                })
                const diseaseResistance = this.coreService.computeDiseaseResistance({
                    diseaseResistance: placedItem.tileInfo.diseaseResistance
                })
                const promise = async () => {
                    try {
                        const session = await this.connection.startSession()
                        await session.withTransaction(async () => {
                            let plant: AbstractPlantSchema
                            if (placedItem.plantInfo.plantType === PlantType.Crop) {
                                plant = this.staticService.crops.find(
                                    (crop) => crop.id === placedItem.plantInfo.crop.toString()
                                )
                            } else {
                                plant = this.staticService.flowers.find(
                                    (flower) => flower.id === placedItem.plantInfo.flower.toString()
                                )
                            }

                            const placedItemType = this.staticService.placedItemTypes.find(
                                (placedItemType) =>
                                    placedItem.placedItemType.toString() ===
                                placedItemType.id.toString()
                            )
                            if (!placedItemType) {
                                throw new Error("Placed item type not found")
                            }
                            // const tile = this.staticService.tiles.find(
                            //     (tile) => tile.id.toString() === placedItemType.tile.toString()
                            // )
                            // Add time to the seed growth
                            // if
                            const updatePlacedItem = (): boolean => {
                            // return if the current stage is already max stage
                                if (placedItem.plantInfo.currentStage >= growthStages - 1) {
                                    return false
                                }
                                // add time to the seed growth
                                placedItem.plantInfo.currentStageTimeElapsed += time * (1 + growthAcceleration)
                                if (
                                    placedItem.plantInfo.currentStageTimeElapsed <
                                plant.growthStageDuration
                                ) {
                                    return false
                                }

                                // deduct the time elapsed from the current stage time elapsed
                                placedItem.plantInfo.currentStageTimeElapsed -=
                                plant.growthStageDuration
                                // increment the current stage
                                placedItem.plantInfo.currentStage += 1
                                //reset fertilizer after
                                placedItem.plantInfo.isFertilized = false

                                // if the current stage is less than max stage - 3, check if need water
                                if (placedItem.plantInfo.currentStage <= growthStages - 3) {
                                    if (Math.random() < needWater) {
                                        placedItem.plantInfo.currentState = PlantCurrentState.NeedWater
                                    }
                                    placedItem.plantInfo.currentStageTimeElapsed = 0
                                    return true
                                }

                                // if the current stage is max stage - 2, check if weedy or infested
                                if (placedItem.plantInfo.currentStage === growthStages - 2) {
                                    if (Math.random() < isWeedyOrInfested) {
                                        if (Math.random() > diseaseResistance) {
                                            if (Math.random() < 0.5) {
                                                placedItem.plantInfo.currentState = PlantCurrentState.IsWeedy
                                            } else {
                                                placedItem.plantInfo.currentState =
                                            PlantCurrentState.IsInfested
                                            }
                                        }
                                    }
                                    return true
                                }
                                // else, the crop is fully matured
                                placedItem.plantInfo.currentStageTimeElapsed = 0
                                placedItem.plantInfo.harvestQuantityDesired = plant.harvestQuantity * (1 + harvestYieldBonus)
                                placedItem.plantInfo.harvestQuantityMin = Math.floor(placedItem.plantInfo.harvestQuantityDesired * this.staticService.cropInfo.minThievablePercentage)
                                if (
                                    placedItem.plantInfo.currentState === PlantCurrentState.IsInfested ||
                                placedItem.plantInfo.currentState === PlantCurrentState.IsWeedy
                                ) {
                                    placedItem.plantInfo.harvestQuantityRemaining = Math.floor(
                                        (placedItem.plantInfo.harvestQuantityMin + placedItem.plantInfo.harvestQuantityDesired) / 2
                                    )
                                } else {
                                    placedItem.plantInfo.harvestQuantityRemaining =
                                    placedItem.plantInfo.harvestQuantityDesired
                                }
                                placedItem.plantInfo.currentState = PlantCurrentState.FullyMatured
                                if (Math.random() < qualityYield) {
                                    placedItem.plantInfo.isQuality = true
                                }
                                return true
                            }
                            const placedItemSnapshot = placedItem.$clone()
                            // update the placed item
                            const synced = updatePlacedItem()
                            await placedItem.save()
                            if (synced) {
                                const updatedSyncedPlacedItem =
                                this.syncService.getPartialUpdatedSyncedPlacedItem({
                                    placedItemSnapshot,
                                    placedItemUpdated: placedItem
                                })
                                syncedPlacedItems.push(updatedSyncedPlacedItem)
                                // create a payload for the kafka producer
                                const syncedPlacedItemsPayload: SyncPlacedItemsPayload = {
                                    data: [updatedSyncedPlacedItem],
                                    userId: placedItem.user.toString()
                                }
                                await this.kafkaProducer.send({
                                    topic: KafkaTopic.SyncPlacedItems,
                                    messages: [
                                        {
                                            value: JSON.stringify(syncedPlacedItemsPayload)
                                        }
                                    ]
                                })
                            }
                        })
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
