import { FruitJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { FruitCurrentState, InjectMongoose, PlacedItemSchema, PlacedItemType } from "@src/databases"
import { DateUtcService } from "@src/date"
import { CoreService, StaticService } from "@src/gameplay"
import { Job } from "bullmq"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Fruit].name)
export class FruitWorker extends WorkerHost {
    private readonly logger = new Logger(FruitWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly coreService: CoreService,
        private readonly staticService: StaticService
    ) {
        super()
    }

    public override async process(job: Job<FruitJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data

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
                createdAt: {
                    $lte: this.dateUtcService.getDayjs(utcTime).toDate()
                }
            })
            .skip(skip)
            .limit(take)
            .sort({ createdAt: "desc" })
        const { hasCaterpillar, needFertilizer } = this.staticService.fruitInfo.randomness
        const promises: Array<Promise<void>> = []
        for (const placedItem of placedItems) {
            const promise = async () => {
                const mongoSession = await this.connection.startSession()
                try {
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
                    const { growthStages } = this.staticService.fruitInfo
                    if (!fruit) {
                        throw new Error("Fruit not found")
                    }
                    // Add time to the seed growth
                    const updatePlacedItem = () => {
                        // return if the current stage is already max stage
                        if (placedItem.fruitInfo.currentStage >= growthStages - 1) {
                            return
                        }
                        // add time to the seed growth
                        placedItem.fruitInfo.currentStageTimeElapsed += time
                        if (
                            placedItem.fruitInfo.currentStageTimeElapsed < fruit.growthStageDuration
                        ) {
                            return
                        }
                        // deduct the time elapsed from the current stage time elapsed
                        placedItem.fruitInfo.currentStageTimeElapsed -= fruit.growthStageDuration
                        // increment the current stage
                        placedItem.fruitInfo.currentStage += 1

                        // if the current stage is less than max stage - 3, check if need water
                        if (placedItem.fruitInfo.currentStage <= growthStages - 3) {
                            if (Math.random() < needFertilizer) {
                                placedItem.fruitInfo.currentState = FruitCurrentState.NeedFertilizer
                            }
                            placedItem.fruitInfo.currentStageTimeElapsed = 0
                            return
                        }

                        // if the current stage is max stage - 2, check if weedy or infested
                        if (placedItem.fruitInfo.currentStage === growthStages - 2) {
                            if (Math.random() < hasCaterpillar) {
                                placedItem.fruitInfo.currentState = FruitCurrentState.IsInfested
                            }
                            return
                        }
                        // else, the fruit is fully matured
                        if (placedItem.fruitInfo.currentState === FruitCurrentState.IsInfested) {
                            placedItem.fruitInfo.harvestQuantityRemaining = Math.floor(
                                (fruit.minHarvestQuantity + fruit.maxHarvestQuantity) / 2
                            )
                        } else {
                            placedItem.fruitInfo.harvestQuantityRemaining = fruit.maxHarvestQuantity
                        }
                        const chance = this.coreService.computeFruitQualityChance({
                            placedItemFruit: placedItem,
                            fruit: fruit
                        })
                        if (Math.random() < chance) {
                            placedItem.fruitInfo.isQuality = true
                        }
                        placedItem.fruitInfo.currentState = FruitCurrentState.FullyMatured
                        return
                    }
                    // update the placed item
                    updatePlacedItem()
                    await placedItem.save({ session: mongoSession })
                } catch (error) {
                    this.logger.error(error)
                } finally {
                    await mongoSession.endSession()
                }
            }
            promises.push(promise())
        }
        await Promise.all(promises)
    }
}
