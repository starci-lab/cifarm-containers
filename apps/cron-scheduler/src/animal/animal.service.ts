import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    AnimalCurrentState,
    AnimalGrowthLastSchedule,
    AnimalInfoEntity,
    Collection,
    CollectionEntity,
    InjectPostgreSQL,
    KeyValueStoreEntity,
    KeyValueStoreId
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { DataSource, LessThanOrEqual, Not } from "typeorm"
import { v4 } from "uuid"
import { AnimalJobData } from "./animal.dto"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { e2eEnabled } from "@src/env"
import { ANIMAL_CACHE_SPEED_UP, AnimalCacheSpeedUpData } from "./animal.e2e"

@Injectable()
export class AnimalService {
    private readonly logger = new Logger(AnimalService.name)
    constructor(
        @InjectQueue(BullQueueName.Animal) private readonly animalQueue: Queue,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService,
        @InjectCache()
        private readonly cacheManager: Cache
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

        const utcNow = this.dateUtcService.getDayjs()
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            count = await queryRunner.manager.count(AnimalInfoEntity, {
                where: {
                    currentState: Not(AnimalCurrentState.Hungry) && Not(AnimalCurrentState.Yield),
                    createdAt: LessThanOrEqual(utcNow.toDate())
                }
            })

            //get the last scheduled time
            const animalGrowthLastSchedule = await queryRunner.manager.findOne(KeyValueStoreEntity, {
                where: {
                    id: KeyValueStoreId.AnimalGrowthLastSchedule
                }
            })
            let date: Date
            if (animalGrowthLastSchedule) {
                date = (animalGrowthLastSchedule.value as AnimalGrowthLastSchedule).date
            }
            //date is 1 second ago

            // this.logger.debug(`Found ${count} animals that need to be grown`)
            if (count === 0) {
                // this.logger.verbose("No animals to grow")
                return
            }

            //split into 10000 per batch
            const batchSize = bullData[BullQueueName.Crop].batchSize
            const batchCount = Math.ceil(count / batchSize)

            let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1
            //e2e code block for e2e purpose-only
            if (e2eEnabled()) {
                const speedUp = await this.cacheManager.get<AnimalCacheSpeedUpData>(ANIMAL_CACHE_SPEED_UP)
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

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.delete(CollectionEntity, {
                    collection: Collection.AnimalSpeedUp
                })
                await queryRunner.manager.save(KeyValueStoreEntity, {
                    id: KeyValueStoreId.AnimalGrowthLastSchedule,
                    value: {
                        date: utcNow.toDate()
                    }
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Error deleting speed up collection: ${error}`)
                await queryRunner.rollbackTransaction()
                throw error
            }
        } finally {
            await queryRunner.release()
        }
    }
}
