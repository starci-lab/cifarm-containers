import { AnimalJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { createObjectId, DeepPartial } from "@src/common"
import {
    ANIMAL,
    AnimalCurrentState,
    AnimalRandomness,
    AnimalSchema,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    SystemId,
    SystemSchema
} from "@src/databases"
import { DateUtcService } from "@src/date"
import { ProductService } from "@src/gameplay"
import { Job } from "bullmq"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Animal].name)
export class AnimalWorker extends WorkerHost {
    private readonly logger = new Logger(AnimalWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly productService: ProductService
    ) {
        super()
    }

    public override async process(job: Job<AnimalJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data
        const placedItemTypes = await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).find({
            type: PlacedItemType.Animal
        }).populate(ANIMAL)
        const placedItems = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                placedItemType: {
                    $in: placedItemTypes.map(placedItemType => placedItemType.id)
                },
                "animalInfo.currentState": {
                    $nin: [AnimalCurrentState.Hungry, AnimalCurrentState.Yield]
                },
                createdAt: {
                    $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                }
            }).skip(skip).limit(take).sort({ createdAt: 1 })
        const { value: { sickChance } } = await this.connection.model<SystemSchema>(SystemSchema.name)
            .findById<KeyValueRecord<AnimalRandomness>>(
                createObjectId(SystemId.AnimalRandomness)
            )
            
        const promises: Array<Promise<void>> = []
        for (const placedItem of placedItems) {
            const promise = async () => {
                const session = await this.connection.startSession()
                try {
                    const updatePlacedItem = () => {
                        const placedItemType = placedItemTypes.find(
                            placedItemType => placedItemType.id === placedItem.placedItemType.toString()
                        )
                        const animal = placedItemType.animal as AnimalSchema
                        // adultAnimalInfoChanges is a function that returns the changes in animalInfo if animal is adult
                        const updateAdultAnimalPlacedItem = () => {
                            // If animal is adult, add time to the animal yield
                            placedItem.animalInfo.currentYieldTime += time
                            
                            // if animal grow to half of the yield time, it may get sick and immunized
                            if (
                                placedItem.animalInfo.currentYieldTime >= Math.floor(animal.yieldTime / 2)
                                && !placedItem.animalInfo.immunized
                            ) {
                                if (Math.random() < sickChance) {
                                    placedItem.animalInfo.currentState = AnimalCurrentState.Sick
                                }
                                placedItem.animalInfo.immunized = true
                                // if animal yield time is more than or equal the yield time, it will yield
                            }
                            if (
                                placedItem.animalInfo.currentYieldTime >=
                                animal.yieldTime
                            ) {
                                placedItem.animalInfo.currentYieldTime = 0
                                //if sick, the harvest quantity is the average of min and max harvest quantity
                                if (placedItem.animalInfo.currentState === AnimalCurrentState.Sick) {
                                    placedItem.animalInfo.harvestQuantityRemaining =
                                        (animal
                                            .minHarvestQuantity +
                                            animal
                                                .maxHarvestQuantity) /
                                        2
                                } else {
                                    // if not sick, the harvest quantity is the max harvest quantity
                                    placedItem.animalInfo.harvestQuantityRemaining =
                                    animal.maxHarvestQuantity
                                }
                                placedItem.animalInfo.currentState = AnimalCurrentState.Yield
                            }
                        }

                        // growthAnimalInfoChanges is a function that returns the changes in animalInfo if animal is not adult
                        const updateBabyAnimalPlacedItem = (): DeepPartial<PlacedItemSchema> => {
                            // Add time to the animal growth and hunger
                            placedItem.animalInfo.currentGrowthTime += time
                            placedItem.animalInfo.currentHungryTime += time

                            // check if animal is enough to be adult
                            if (
                                placedItem.animalInfo.currentGrowthTime >=
                                animal.growthTime
                            ) {
                                placedItem.animalInfo.isAdult = true
                                placedItem.animalInfo.currentState = AnimalCurrentState.Hungry
                                return
                            }

                            // check if animal is hungry
                            if (
                                placedItem.animalInfo.currentHungryTime >=
                                animal.hungerTime
                            ) {
                                placedItem.animalInfo.currentHungryTime = 0
                                placedItem.animalInfo.currentState = AnimalCurrentState.Hungry
                                return
                            }

                            const chance = this.productService.computeAnimalQualityChance({
                                animalInfo: placedItem.animalInfo,
                                qualityProductChanceLimit: animal.qualityProductChanceLimit,
                                qualityProductChanceStack: animal.qualityProductChanceStack
                            })

                            if (Math.random() < chance) {
                                placedItem.animalInfo.isQuality = true
                            }

                            return
                        }

                        // If animal is adult, call adultAnimalInfoChanges, else call growthAnimalInfoChanges
                        if (placedItem.animalInfo.isAdult) {
                            return updateAdultAnimalPlacedItem()
                        } 
                        return updateBabyAnimalPlacedItem() 
                    }
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
