import { Injectable, Logger, OnModuleInit } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    FruitCurrentState,
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId,
    KeyValueStoreSchema,
    PlacedItemSchema,
    PlacedItemType,
    FruitLastSchedule
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { FruitJobData } from "./fruit.dto"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { FRUIT_CACHE_SPEED_UP, FruitCacheSpeedUpData } from "./fruit.e2e"
import { e2eEnabled } from "@src/env"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { StaticService } from "@src/gameplay"

@Injectable()
export class FruitService implements OnModuleInit {
    private readonly logger = new Logger(FruitService.name)
    constructor(
        @InjectQueue(BullQueueName.Fruit) private readonly fruitQueue: Queue,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService
    ) {}

    public async onModuleInit() {
        // clear all jobs in the queue
        await this.fruitQueue.drain(true)
    }

    @Cron("*/1 * * * * *")
    async process() {
        const mongoSession = await this.connection.startSession()
        try {
            const utcNow = this.dateUtcService.getDayjs()
            // Create a query runner
            const placedItemTypes = this.staticService.placedItemTypes.filter(
                (placedItemType) => placedItemType.type === PlacedItemType.Fruit
            )
            const count = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    placedItemType: {
                        $in: placedItemTypes.map((placedItemType) => placedItemType.id)
                    },
                    fruitInfo: {
                        // not null
                        $ne: null
                    },
                    "fruitInfo.currentState": {
                        $nin: [FruitCurrentState.NeedFertilizer, FruitCurrentState.FullyMatured]
                    },
                    createdAt: {
                        $lte: this.dateUtcService.getDayjs(utcNow).toDate()
                    }
                })
                .session(mongoSession)
            //get the last scheduled time, get from db not cache
            // const fruitGrowthLastSchedule = await queryRunner.manager.findOne(KeyValueStoreEntity, {
            //     where: {
            //         id: KeyValueStoreId.FruitGrowthLastSchedule
            //     }
            // })
            this.logger.verbose(`Found ${count} fruits that need to be grown`)
            const {
                value: { date }
            } = await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .findById<
                    KeyValueRecord<FruitLastSchedule>
                >(createObjectId(KeyValueStoreId.FruitLastSchedule))

            // this.logger.debug(`Found ${count} fruits that need to be grown`)
            if (count !== 0) {
                //split into 10000 per batch
                const batchSize = bullData[BullQueueName.Fruit].batchSize
                const batchCount = Math.ceil(count / batchSize)

                let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1

                //e2e code block for e2e purpose-only
                if (e2eEnabled()) {
                    const speedUp =
                        await this.cacheManager.get<FruitCacheSpeedUpData>(FRUIT_CACHE_SPEED_UP)
                    if (speedUp) {
                        time += speedUp.time
                        await this.cacheManager.del(FRUIT_CACHE_SPEED_UP)
                    }
                }

                // Create batches
                const batches: Array<{
                    name: string
                    data: FruitJobData
                    opts?: BulkJobOptions
                }> = Array.from({ length: batchCount }, (_, i) => ({
                    name: v4(),
                    data: {
                        skip: i * batchSize,
                        take: Math.min((i + 1) * batchSize, count),
                        time,
                        utcTime: utcNow.valueOf()
                    },
                    opts: bullData[BullQueueName.Fruit].opts
                }))
                await this.fruitQueue.addBulk(batches)
            }

            await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .updateOne(
                    {
                        _id: createObjectId(KeyValueStoreId.FruitLastSchedule)
                    },
                    {
                        value: {
                            date: utcNow.toDate()
                        }
                    }
                )
                .session(mongoSession)
        } catch (error) {
            this.logger.error(error)
        } finally {
            await mongoSession.endSession()
        }
    }
}
