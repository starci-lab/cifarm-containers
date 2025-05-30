import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    EnergyRegenerationLastSchedule,
    InjectMongoose,
    KeyValueRecord,
    KeyValueStoreId,
    KeyValueStoreSchema,
    UserSchema
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { EnergyJobData } from "./energy.dto"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { ENERGY_CACHE_SPEED_UP, EnergyCacheSpeedUpData } from "./energy.e2e"
import { e2eEnabled } from "@src/env"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
// use different name to avoid conflict with the EnergyService exported from the gameplay module
@Injectable()
export class EnergyService {
    private readonly logger = new Logger(EnergyService.name)

    constructor(
        @InjectQueue(BullQueueName.Energy) private readonly energyQueue: Queue,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        @InjectCache()
        private readonly cacheManager: Cache
    ) {}

    @Cron("*/1 * * * * *")
    async process() {
        const mongoSession = await this.connection.startSession()
        try {
            const utcNow = this.dateUtcService.getDayjs()
            const count = await this.connection
                .model<UserSchema>(UserSchema.name)
                .countDocuments({
                    energyFull: false,
                })
                .session(mongoSession)
            //get the last scheduled time
            const {
                value: { date }
            } = await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .findById<
                    KeyValueRecord<EnergyRegenerationLastSchedule>
                >(createObjectId(KeyValueStoreId.EnergyRegenerationLastSchedule))
                .session(mongoSession)

            this.logger.verbose(`Found ${count} users that need energy regeneration`)
            if (count === 0) {
                //no user needs energy regeneration
                return
            }

            //split into 10000 per batch
            const batchSize = bullData[BullQueueName.Energy].batchSize
            const batchCount = Math.ceil(count / batchSize)

            let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1

            //e2e code block for e2e purpose-only
            if (e2eEnabled()) {
                const speedUp =
                    await this.cacheManager.get<EnergyCacheSpeedUpData>(ENERGY_CACHE_SPEED_UP)
                if (speedUp) {
                    time += speedUp.time
                    await this.cacheManager.del(ENERGY_CACHE_SPEED_UP)
                }
            }

            // Create batches
            const batches: Array<{
                name: string
                data: EnergyJobData
                opts?: BulkJobOptions
            }> = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: Math.min((i + 1) * batchSize, count),
                    time,
                    utcTime: utcNow.valueOf()
                },
                opts: bullData[BullQueueName.Energy].opts
            }))
            //this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            await this.energyQueue.addBulk(batches)

            await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .updateOne(
                    {
                        _id: createObjectId(KeyValueStoreId.EnergyRegenerationLastSchedule)
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
