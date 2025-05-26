import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    AnimalCurrentState,
    AnimalLastSchedule,
    InjectMongoose,
    KeyValueStoreId,
    KeyValueStoreSchema,
    PlacedItemSchema,
    KeyValueRecord,
    PlacedItemType,
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { AnimalJobData } from "./animal.dto"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { e2eEnabled } from "@src/env"
import { ANIMAL_CACHE_SPEED_UP, AnimalCacheSpeedUpData } from "./animal.e2e"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { StaticService } from "@src/gameplay"
import { LeaderElectedEvent, LeaderLostEvent } from "@aurory/nestjs-k8s-leader-election"
import { OnEvent } from "@nestjs/event-emitter"
@Injectable()
export class AnimalService {
    private readonly logger = new Logger(AnimalService.name)
    constructor(
        @InjectQueue(BullQueueName.Animal) private readonly animalQueue: Queue,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService,
        @InjectCache()
        private readonly cacheManager: Cache,
        private readonly staticService: StaticService
    ) {}

    // Flag to determine if the current instance is the leader
    private isLeader = false

    @OnEvent(LeaderElectedEvent)
    handleLeaderElected() {
        this.isLeader = true
    }

    @OnEvent(LeaderLostEvent)
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
            const placedItemTypes = this.staticService.placedItemTypes.filter(placedItemType => placedItemType.type === PlacedItemType.Animal)
            const count = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    placedItemType: {
                        $in: placedItemTypes.map((placedItemType) => placedItemType.id)
                    },
                    "animalInfo.currentState": {
                        $nin: [AnimalCurrentState.Hungry, AnimalCurrentState.Yield]
                    }
                })
                .session(mongoSession)

            const {
                value: { date }
            } = await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .findById<
                    KeyValueRecord<AnimalLastSchedule>
                >(createObjectId(KeyValueStoreId.AnimalLastSchedule))
                .session(mongoSession)
            if (count === 0) {
                // this.logger.verbose("No animals to grow")
                return
            }

            //split into 10000 per batch
            const batchSize = bullData[BullQueueName.Animal].batchSize
            const batchCount = Math.ceil(count / batchSize)

            let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1
            //e2e code block for e2e purpose-only
            if (e2eEnabled()) {
                const speedUp =
                    await this.cacheManager.get<AnimalCacheSpeedUpData>(ANIMAL_CACHE_SPEED_UP)
                if (speedUp) {
                    time += speedUp.time
                    await this.cacheManager.del(ANIMAL_CACHE_SPEED_UP)
                }
            }

            // Create batches
            const batches: Array<{
                name: string
                data: AnimalJobData
                opts?: BulkJobOptions
            }> = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: Math.min((i + 1) * batchSize, count),
                    time,
                    utcTime: utcNow.valueOf()
                },
                opts: bullData[BullQueueName.Animal].opts
            }))
            //this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            const jobs = await this.animalQueue.addBulk(batches)
            this.logger.verbose(`Added ${jobs.at(0).name} jobs to the animal queue. Time: ${time}`)
            
            await this.connection
                .model<KeyValueStoreSchema>(KeyValueStoreSchema.name)
                .updateOne(
                    {
                        _id: createObjectId(KeyValueStoreId.AnimalLastSchedule)
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
