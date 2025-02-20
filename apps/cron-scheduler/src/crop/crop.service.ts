import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    AnimalCurrentState,
    CropGrowthLastSchedule,
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId,
    KeyValueStoreSchema,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { CropJobData } from "./crop.dto"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { CROP_CACHE_SPEED_UP, CropCacheSpeedUpData } from "./crop.e2e"
import { e2eEnabled } from "@src/env"
import { Connection } from "mongoose"

@Injectable()
export class CropService {
    private readonly logger = new Logger(CropService.name)
    constructor(
        @InjectQueue(BullQueueName.Crop) private readonly cropQueue: Queue,
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly dateUtcService: DateUtcService,
    ) {
    }

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
        mongoSession.startTransaction()

        try {
            const utcNow = this.dateUtcService.getDayjs()
            // Create a query runner
            const placedItemTypes = await this.connection.model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name).find({
                type: PlacedItemType.Tile
            }).session(mongoSession)
            const count = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).countDocuments({
                placedItemType: {
                    $in: placedItemTypes.map(placedItemType => placedItemType.id)
                },
                seedGrowthInfo: {
                    // not null
                    $ne: null
                },
                // Compare this snippet from apps/cron-scheduler/src/animal/animal.service.ts:
                "seedGrowthInfo.currentState": {
                    $nin: [AnimalCurrentState.Hungry, AnimalCurrentState.Yield]
                },
                createdAt: {
                    $lte: utcNow.toDate()
                }
            }).session(mongoSession)
 
            //get the last scheduled time, get from db not cache
            // const cropGrowthLastSchedule = await queryRunner.manager.findOne(KeyValueStoreEntity, {
            //     where: {
            //         id: KeyValueStoreId.CropGrowthLastSchedule
            //     }
            // })
            const { value: { date } } = await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .findById<KeyValueRecord<CropGrowthLastSchedule>>(KeyValueStoreId.CropGrowthLastSchedule)

            // this.logger.debug(`Found ${count} crops that need to be grown`)
            if (count !== 0) {
            //split into 10000 per batch
                const batchSize = bullData[BullQueueName.Crop].batchSize
                const batchCount = Math.ceil(count / batchSize)

                let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1
                
                //e2e code block for e2e purpose-only
                if (e2eEnabled()) {
                    const speedUp = await this.cacheManager.get<CropCacheSpeedUpData>(CROP_CACHE_SPEED_UP)
                    if (speedUp) {
                        time += speedUp.time
                        await this.cacheManager.del(CROP_CACHE_SPEED_UP)
                    }
                }

                // Create batches
                const batches: Array<{
                name: string
                data: CropJobData,
                opts?: BulkJobOptions
            }> = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: Math.min((i + 1) * batchSize, count),
                    time,
                    utcTime: utcNow.valueOf()
                },
                opts: bullData[BullQueueName.Crop].opts
            }))
                const jobs = await this.cropQueue.addBulk(batches)
                this.logger.verbose(`Added ${jobs.at(0).name} jobs to the crop queue. Time: ${time}`)
            }

            await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).updateOne({
                _id: KeyValueStoreId.CropGrowthLastSchedule
            }, {
                value: {
                    date: utcNow.toDate()
                }
            })
            await this.connection.model<KeyValueStoreSchema>(KeyValueStoreSchema.name).updateOne({
                _id: KeyValueStoreId.AnimalGrowthLastSchedule
            }, {
                value: {
                    date: utcNow.toDate()
                }
            }).session(mongoSession)
            await mongoSession.commitTransaction()
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        }
        finally {
            await mongoSession.endSession()
        }
    }
}
