import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    PlantCurrentState,
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId,
    KeyValueStoreSchema,
    PlacedItemSchema,
    PlacedItemType,
    PlantLastSchedule
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { CropJobData } from "./plant.dto"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { CROP_CACHE_SPEED_UP, CropCacheSpeedUpData } from "./plant.e2e"
import { e2eEnabled } from "@src/env"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { StaticService } from "@src/gameplay"

@Injectable()
export class PlantService  {
    private readonly logger = new Logger(PlantService.name)
    constructor(
        @InjectQueue(BullQueueName.Plant) private readonly plantQueue: Queue,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly dateUtcService: DateUtcService,
        private readonly staticService: StaticService
    ) {}

    @Cron("*/1 * * * * *")
    async process() {
        const mongoSession = await this.connection.startSession()
        try {
            const utcNow = this.dateUtcService.getDayjs()
            // Create a query runner
            const placedItemTypes = this.staticService.placedItemTypes.filter(
                (placedItemType) => placedItemType.type === PlacedItemType.Tile
            )
            const count = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    placedItemType: {
                        $in: placedItemTypes.map((placedItemType) => placedItemType.id)
                    },
                    plantInfo: {
                        // not null
                        $ne: null
                    },
                    // Compare this snippet from apps/cron-scheduler/src/animal/animal.service.ts:
                    "plantInfo.currentState": {
                        $nin: [PlantCurrentState.NeedWater, PlantCurrentState.FullyMatured]
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
                .findById<KeyValueRecord<PlantLastSchedule>>(
                    createObjectId(KeyValueStoreId.PlantLastSchedule)
                )
            this.logger.verbose(`Found ${count} crops that need to be grown`)
            // this.logger.debug(`Found ${count} crops that need to be grown`)
            if (count !== 0) {
                //split into 10000 per batch
                const batchSize = bullData[BullQueueName.Plant].batchSize
                const batchCount = Math.ceil(count / batchSize)

                let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1

                //e2e code block for e2e purpose-only
                if (e2eEnabled()) {
                    const speedUp =
                        await this.cacheManager.get<CropCacheSpeedUpData>(CROP_CACHE_SPEED_UP)
                    if (speedUp) {
                        time += speedUp.time
                        await this.cacheManager.del(CROP_CACHE_SPEED_UP)
                    }
                }

                // Create batches
                const batches: Array<{
                    name: string
                    data: CropJobData
                    opts?: BulkJobOptions
                }> = Array.from({ length: batchCount }, (_, i) => ({
                    name: v4(),
                    data: {
                        skip: i * batchSize,
                        take: Math.min((i + 1) * batchSize, count),
                        time,
                        utcTime: utcNow.valueOf()
                    },
                    opts: bullData[BullQueueName.Plant].opts
                }))
                await this.plantQueue.addBulk(batches)

            }

            await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .updateOne(
                    {
                        _id: createObjectId(KeyValueStoreId.PlantLastSchedule)
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
