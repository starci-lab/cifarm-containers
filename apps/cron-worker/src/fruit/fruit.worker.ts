import { FruitJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import {
    FruitCurrentState,
    FruitSchema,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    TILE_INFO
} from "@src/databases"
import { DateUtcService } from "@src/date"
import { ProductService, StaticService } from "@src/gameplay"
import { Job } from "bullmq"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Fruit].name)
export class FruitWorker extends WorkerHost {
    private readonly logger = new Logger(FruitWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        private readonly productService: ProductService,
        private readonly staticService: StaticService
    ) {
        super()
    }

    public override async process(job: Job<FruitJobData>): Promise<void> {
        this.logger.verbose(`Processing job: ${job.id}`)
        const { time, skip, take, utcTime } = job.data

        const placedItemTypes = await this.connection
            .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
            .find({
                type: PlacedItemType.Fruit
            })
        const placedItems = await this.connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .find({
                placedItemType: {
                    $in: placedItemTypes.map((placedItemType) => placedItemType.id),
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
            .populate(TILE_INFO)
            .skip(skip)
            .limit(take) 
            .sort({ createdAt: "desc" }) 
        const { hasCaterpillar, needFertilizer } = this.staticService.fruitRandomness
        const promises: Array<Promise<void>> = []
        for (const placedItem of placedItems) {
            const promise = async () => {
                const session = await this.connection.startSession()
                try {
                    const fruit = await this.connection
                        .model<FruitSchema>(FruitSchema.name)
                        .findById(placedItem.fruitInfo.fruit)
                        .session(session)
                    // Add time to the seed growth
                    const updatePlacedItem = () => {
                        // return if the current stage is already max stage
                        if (
                            placedItem.fruitInfo.currentStage >= fruit.growthStages - 1
                        ) {
                            return
                        }
                        // add time to the seed growth
                        placedItem.fruitInfo.currentStageTimeElapsed += time
                        if (
                            placedItem.fruitInfo.currentStageTimeElapsed <
                                fruit.growthStageDuration
                        ) {
                            return
                        }
                        // deduct the time elapsed from the current stage time elapsed
                        placedItem.fruitInfo.currentStageTimeElapsed -=
                                fruit.growthStageDuration
                        // increment the current stage
                        placedItem.fruitInfo.currentStage += 1

                        // if the current stage is less than max stage - 3, check if need water
                        if (placedItem.fruitInfo.currentStage <= fruit.growthStages - 3) {
                            if (Math.random() < needFertilizer) {
                                placedItem.fruitInfo.currentState =
                                        FruitCurrentState.NeedFertilizer
                            }
                            placedItem.fruitInfo.currentStageTimeElapsed = 0
                            return
                        }

                        // if the current stage is max stage - 2, check if weedy or infested
                        if (placedItem.fruitInfo.currentStage === fruit.growthStages - 2) {
                            if (Math.random() < hasCaterpillar) {
                                placedItem.fruitInfo.currentState =
                                FruitCurrentState.IsInfested
                            }
                            return
                        }
                        // else, the fruit is fully matured
                        if (
                            placedItem.fruitInfo.currentState ===
                                    FruitCurrentState.IsInfested
                        ) {
                            placedItem.fruitInfo.harvestQuantityRemaining =
                                    Math.floor((fruit.minHarvestQuantity + fruit.maxHarvestQuantity) / 2)
                        } else {
                            placedItem.fruitInfo.harvestQuantityRemaining =
                                    fruit.maxHarvestQuantity
                        }
                        const chance = this.productService.computeFruitQualityChance({
                            fruitInfo: placedItem.fruitInfo,
                            qualityProductChanceLimit: fruit.qualityProductChanceLimit,
                            qualityProductChanceStack: fruit.qualityProductChanceStack
                        })
                        if (Math.random() < chance) {
                            placedItem.fruitInfo.isQuality = true
                        }
                        placedItem.fruitInfo.currentState = FruitCurrentState.FullyMatured
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
