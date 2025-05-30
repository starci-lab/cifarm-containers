import { AnimalJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { WithStatus } from "@src/common"
import {
    AnimalCurrentState,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType
} from "@src/databases"
import { DateUtcService } from "@src/date"
import { StaticService, CoreService, SyncService } from "@src/gameplay"
import { Job } from "bullmq"
import { Connection } from "mongoose"
import { Producer } from "kafkajs"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { SyncPlacedItemsPayload } from "@apps/ws"
import { envConfig } from "@src/env"
@Processor(bullData[BullQueueName.Animal].name)
export class AnimalWorker extends WorkerHost {
    private readonly logger = new Logger(AnimalWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService,
        private readonly coreService: CoreService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {
        super()
    }

    public override async process(job: Job<AnimalJobData>): Promise<void> {
        if ((Date.now() - job.timestamp) > envConfig().cron.timeout) {
            this.logger.warn(`Removed old job: ${job.id}`)
            return
        }  
        try {
            const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []

            this.logger.verbose(`Processing job: ${job.id}`)
            const { time, skip, take, utcTime } = job.data
            const placedItems = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .find({
                    placedItemType: {
                        $in: this.staticService.placedItemTypes
                            .filter(
                                (placedItemType) => placedItemType.type === PlacedItemType.Animal
                            )
                            .map((placedItemType) => placedItemType.id)
                    },
                    "animalInfo.currentState": {
                        $nin: [AnimalCurrentState.Hungry, AnimalCurrentState.Yield]
                    },
                    createdAt: {
                        $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                    }
                })
                .skip(skip)
                .limit(take)
                .sort({ createdAt: 1 })
            const { sickChance } = this.staticService.animalInfo.randomness

            const promises: Array<Promise<void>> = []
            for (const placedItem of placedItems) {
                const growthAcceleration = this.coreService.computeGrowthAcceleration({
                    growthAcceleration: placedItem.animalInfo.growthAcceleration
                })
                const qualityYield = this.coreService.computeQualityYield({
                    qualityYield: placedItem.animalInfo.qualityYield
                })
                const harvestYieldBonus = this.coreService.computeHarvestYieldBonus({
                    harvestYieldBonus: placedItem.animalInfo.harvestYieldBonus
                })
                const diseaseResistance = this.coreService.computeDiseaseResistance({
                    diseaseResistance: placedItem.animalInfo.diseaseResistance
                })
                const promise = async () => {
                    try {
                        const session = await this.connection.startSession()
                        await session.withTransaction(async () => {
                            const updatePlacedItem = () => {
                                const placedItemType = this.staticService.placedItemTypes.find(
                                    (placedItemType) =>
                                        placedItemType.id === placedItem.placedItemType.toString()
                                )
                                const animal = this.staticService.animals.find(
                                    (animal) => animal.id === placedItemType.animal.toString()
                                )
                                if (!animal) {
                                    throw new Error(`Animal not found: ${placedItemType.animal}`)
                                }
                                // adultAnimalInfoChanges is a function that returns the changes in animalInfo if animal is adult
                                const updateAdultAnimalPlacedItem = (): boolean => {
                                    // If animal is adult, add time to the animal yield
                                    placedItem.animalInfo.currentYieldTime += time * (1 + growthAcceleration)

                                    // if animal grow to half of the yield time, it may get sick and immunized
                                    if (
                                        placedItem.animalInfo.currentYieldTime >=
                                        Math.floor(animal.yieldTime / 2) &&
                                        !placedItem.animalInfo.immunized
                                    ) {
                                        if (Math.random() < sickChance) {
                                            if (Math.random() > diseaseResistance) {
                                                placedItem.animalInfo.currentState = AnimalCurrentState.Sick
                                            }
                                        }
                                        placedItem.animalInfo.immunized = true
                                        // if animal yield time is more than or equal the yield time, it will yield
                                    }
                                    if (placedItem.animalInfo.currentYieldTime >= animal.yieldTime) {
                                        placedItem.animalInfo.currentYieldTime = 0
                                        placedItem.animalInfo.harvestQuantityDesired = animal.harvestQuantity * (1 + harvestYieldBonus)
                                        placedItem.animalInfo.harvestQuantityMin = Math.floor(placedItem.animalInfo.harvestQuantityDesired * this.staticService.animalInfo.minThievablePercentage)
                                        //if sick, the harvest quantity is the average of min and max harvest quantity
                                        if (
                                            placedItem.animalInfo.currentState === AnimalCurrentState.Sick
                                        ) {
                                            placedItem.animalInfo.harvestQuantityRemaining = Math.floor(
                                                (placedItem.animalInfo.harvestQuantityMin + placedItem.animalInfo.harvestQuantityDesired) / 2
                                            )
                                        } else {
                                            // if not sick, the harvest quantity is the max harvest quantity
                                            placedItem.animalInfo.harvestQuantityRemaining =
                                                placedItem.animalInfo.harvestQuantityDesired
                                        }
                                        placedItem.animalInfo.currentState = AnimalCurrentState.Yield

                                        if (Math.random() < qualityYield) {
                                            placedItem.animalInfo.isQuality = true
                                        }
                                        return true
                                    }
                                    return false
                                }

                                // growthAnimalInfoChanges is a function that returns the changes in animalInfo if animal is not adult
                                const updateBabyAnimalPlacedItem = (): boolean => {
                                    // Add time to the animal growth and hunger
                                    placedItem.animalInfo.currentGrowthTime += time
                                    placedItem.animalInfo.currentHungryTime += time

                                    // check if animal is enough to be adult
                                    if (placedItem.animalInfo.currentGrowthTime >= animal.growthTime) {
                                        placedItem.animalInfo.isAdult = true
                                        placedItem.animalInfo.currentState = AnimalCurrentState.Hungry
                                        return true
                                    }

                                    // check if animal is hungry
                                    if (placedItem.animalInfo.currentHungryTime >= animal.hungerTime) {
                                        placedItem.animalInfo.currentHungryTime = 0
                                        placedItem.animalInfo.currentState = AnimalCurrentState.Hungry
                                        return true
                                    }
                                    return false
                                }

                                // If animal is adult, call adultAnimalInfoChanges, else call growthAnimalInfoChanges
                                if (placedItem.animalInfo.isAdult) {
                                    return updateAdultAnimalPlacedItem()
                                }
                                return updateBabyAnimalPlacedItem()
                            }
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
                        })
                        await session.endSession()
                    } catch (error) {
                        this.logger.error(`Error processing animal ${placedItem._id}:`, error)
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
