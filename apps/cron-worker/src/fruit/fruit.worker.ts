import { FruitJobData } from "@apps/cron-scheduler"
import { SyncPlacedItemsPayload } from "@apps/ws"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { bullData, BullQueueName } from "@src/bull"
import { WithStatus } from "@src/common"
import { FruitCurrentState, InjectMongoose, PlacedItemSchema, PlacedItemType } from "@src/databases"
import { DateUtcService } from "@src/date"
import { CoreService, StaticService, SyncService } from "@src/gameplay"
import { Job } from "bullmq"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Fruit].name)
export class FruitWorker extends WorkerHost {
    private readonly logger = new Logger(FruitWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly coreService: CoreService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {
        super()
    }

    public override async process(job: Job<FruitJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data
        try {
            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    placedItemType: {
                        $in: this.staticService.placedItemTypes.map(
                            (placedItemType) => placedItemType.id
                        )
                    },
                    fruitInfo: {
                        $ne: null
                    },
                    "fruitInfo.currentState": {
                        $nin: [FruitCurrentState.NeedFertilizer, FruitCurrentState.FullyMatured]
                    },
                    isStored: {
                        $ne: true
                    },
                    createdAt: {
                        $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                    }
                })
                .skip(skip)
                .limit(take)
                .sort({ createdAt: "desc" })
            const {
                randomness: {
                    isBuggy,
                },
                matureGrowthStage,
                growthStages
            } = this.staticService.fruitInfo
            const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
            const promises: Array<Promise<void>> = []
            for (const placedItem of placedItems) {
                const growthAcceleration = this.coreService.computeGrowthAcceleration({
                    growthAcceleration: placedItem.fruitInfo.growthAcceleration
                })
                const qualityYield = this.coreService.computeQualityYield({
                    qualityYield: placedItem.fruitInfo.qualityYield
                })
                const harvestYieldBonus = this.coreService.computeHarvestYieldBonus({
                    harvestYieldBonus: placedItem.fruitInfo.harvestYieldBonus
                })
                const diseaseResistance = this.coreService.computeDiseaseResistance({
                    diseaseResistance: placedItem.fruitInfo.diseaseResistance
                })
                const promise = async () => {
                    const placedItemType = this.staticService.placedItemTypes.find(
                        (placedItemType) =>
                            placedItemType.id === placedItem.placedItemType.toString()
                    )
                    if (!placedItemType) {
                        throw new Error("Placed item type not found")
                    }
                    const fruit = this.staticService.fruits.find(
                        (fruit) =>
                            placedItemType.type === PlacedItemType.Fruit &&
                            fruit.id === placedItemType.fruit.toString()
                    )
                    if (!fruit) {
                        throw new Error("Fruit not found")
                    }
                    // Add time to the fruit
                    const updatePlacedItem = (): boolean => {
                    // return if the current stage is already max stage
                        if (placedItem.fruitInfo.currentStage >= growthStages - 1) {
                            return false
                        }
                        // adultAnimalInfoChanges is a function that returns the changes in animalInfo if animal is adult
                        const updateMatureFruitPlacedItem = (): boolean => {
                            // If fruit is mature
                            placedItem.fruitInfo.currentStageTimeElapsed += time * (1 + growthAcceleration)
                            if (
                                placedItem.fruitInfo.currentStageTimeElapsed <
                                fruit.matureGrowthStageDuration
                            ) {
                                return false
                            }
                            placedItem.fruitInfo.currentStage += 1
                            if (
                                placedItem.fruitInfo.currentStage === growthStages - 2
                            ) {
                                // become buggy
                                if (Math.random() < isBuggy) {
                                    if (Math.random() > diseaseResistance) {
                                        placedItem.fruitInfo.currentState = FruitCurrentState.IsBuggy
                                    }
                                }
                                placedItem.fruitInfo.currentStageTimeElapsed -= fruit.matureGrowthStageDuration
                                return true
                            }
                            if (placedItem.fruitInfo.currentStage === growthStages - 1) {
                                placedItem.fruitInfo.currentStageTimeElapsed = 0
                                placedItem.fruitInfo.harvestQuantityDesired = Math.floor(fruit.harvestQuantity * (1 + harvestYieldBonus))
                                placedItem.fruitInfo.harvestQuantityMin = Math.floor(placedItem.fruitInfo.harvestQuantityDesired * this.staticService.fruitInfo.minThievablePercentage)
                                //if sick, the harvest quantity is the average of min and max harvest quantity
                                if (
                                    placedItem.fruitInfo.currentState === FruitCurrentState.IsBuggy
                                ) {
                                    placedItem.fruitInfo.harvestQuantityRemaining = Math.floor(
                                        (placedItem.fruitInfo.harvestQuantityMin + placedItem.fruitInfo.harvestQuantityDesired) / 2
                                    )
                                } else {
                                // if not sick, the harvest quantity is the max harvest quantity
                                    placedItem.fruitInfo.harvestQuantityRemaining =
                                    placedItem.fruitInfo.harvestQuantityDesired
                                }
                                placedItem.fruitInfo.currentState = FruitCurrentState.FullyMatured
                                // quality yield
                                if (Math.random() < qualityYield) {
                                    placedItem.fruitInfo.isQuality = true
                                }
                                return true
                            }
                            return false
                        }

                        const updateYoungFruitPlacedItem = (): boolean => {
                        // check if 
                        // add time to the seed growth
                            placedItem.fruitInfo.currentStageTimeElapsed += time
                            placedItem.fruitInfo.currentFertilizerTime += time

                            // check if need fertilizer
                            if (placedItem.fruitInfo.currentFertilizerTime >= fruit.fertilizerTime) {
                                placedItem.fruitInfo.currentState = FruitCurrentState.NeedFertilizer
                                placedItem.fruitInfo.currentFertilizerTime = 0
                                return true
                            }
                            
                            // check if grow to next stage
                            if (placedItem.fruitInfo.currentStageTimeElapsed >= fruit.youngGrowthStageDuration) {
                                placedItem.fruitInfo.currentStage += 1
                                placedItem.fruitInfo.currentStageTimeElapsed = 0
                                placedItem.fruitInfo.currentFertilizerTime = 0
                                placedItem.fruitInfo.currentState = FruitCurrentState.NeedFertilizer
                                return true
                            }
                            return false
                        }

                        const isMature = placedItem.fruitInfo.currentStage >= matureGrowthStage
                        if (isMature) {
                            return updateMatureFruitPlacedItem()
                        }
                        return updateYoungFruitPlacedItem()
                    }
                    // update the placed item
                    const placedItemSnapshot = placedItem.$clone()
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
                }
                promises.push(promise())
            }
            await Promise.all(promises)
        } catch (error) {
            this.logger.error(error)
        }
    }
}
