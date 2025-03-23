import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    BeeHouseCurrentState,
    BeeHouseLastSchedule,
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId,
    KeyValueStoreSchema,
    PlacedItemSchema,
    PlacedItemTypeId
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { BeeHouseJobData } from "./bee-house.dto"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { BEE_HOUSE_CACHE_SPEED_UP, BeeHouseCacheSpeedUpData } from "./bee-house.e2e"
import { e2eEnabled } from "@src/env"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

@Injectable()
export class BeeHouseService {
    private readonly logger = new Logger(BeeHouseService.name)
    constructor(
        @InjectQueue(BullQueueName.BeeHouse) private readonly beeHouseQueue: Queue,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly dateUtcService: DateUtcService
    ) {}

    // Flag to determine if the current instance is the leader
    private isLeader = false

    @OnEventLeaderElected()
    handleLeaderElected() {
        this.isLeader = true
    }

    @OnEventLeaderLost()
    handleLeaderLost() {
        this.isLeader = false
    }

    @Cron("*/1 * * * * *")
    async process() {
        if (!this.isLeader) {
            return
        }

        const mongoSession = await this.connection.startSession()

        try {
            const utcNow = this.dateUtcService.getDayjs()
            // Create a query runner
            const count = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    placedItemType: createObjectId(PlacedItemTypeId.BeeHouse),
                    buildingInfo: {
                        $ne: null
                    },
                    beeHouseInfo: {
                        $ne: null
                    },
                    // Compare this snippet from apps/cron-scheduler/src/animal/animal.service.ts:
                    "beeHouseInfo.currentState": {
                        $nin: [BeeHouseCurrentState.Yield]
                    },
                    createdAt: {
                        $lte: this.dateUtcService.getDayjs(utcNow).toDate()
                    }
                })
                .session(mongoSession)
            const {
                value: { date }
            } = await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .findById<
                    KeyValueRecord<BeeHouseLastSchedule>
                >(createObjectId(KeyValueStoreId.BeeHouseLastSchedule))

            // this.logger.debug(`Found ${count} crops that need to be grown`)
            if (count !== 0) {
                //split into 10000 per batch
                const batchSize = bullData[BullQueueName.BeeHouse].batchSize
                const batchCount = Math.ceil(count / batchSize)

                let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1

                //e2e code block for e2e purpose-only
                if (e2eEnabled()) {
                    const speedUp =
                        await this.cacheManager.get<BeeHouseCacheSpeedUpData>(BEE_HOUSE_CACHE_SPEED_UP)
                    if (speedUp) {
                        time += speedUp.time
                        await this.cacheManager.del(BEE_HOUSE_CACHE_SPEED_UP)
                    }
                }

                // Create batches
                const batches: Array<{
                    name: string
                    data: BeeHouseJobData
                    opts?: BulkJobOptions
                }> = Array.from({ length: batchCount }, (_, i) => ({
                    name: v4(),
                    data: {
                        skip: i * batchSize,
                        take: Math.min((i + 1) * batchSize, count),
                        time,
                        utcTime: utcNow.valueOf()
                    },
                    opts: bullData[BullQueueName.BeeHouse].opts
                }))
                const jobs = await this.beeHouseQueue.addBulk(batches)
                this.logger.verbose(
                    `Added ${jobs.at(0).name} jobs to the bee house queue. Time: ${time}`
                )
            }

            await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .updateOne(
                    {
                        _id: createObjectId(KeyValueStoreId.BeeHouseLastSchedule)
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
