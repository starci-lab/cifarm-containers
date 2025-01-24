import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName } from "@src/bull"
import {
    Collection,
    CollectionEntity,
    EnergyGrowthLastSchedule,
    InjectPostgreSQL,
    KeyValueStoreEntity,
    KeyValueStoreId,
    UserEntity
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { DataSource, LessThanOrEqual } from "typeorm"
import { v4 } from "uuid"
import { EnergyJobData } from "./energy.dto"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { ENERGY_CACHE_SPEED_UP, EnergyCacheSpeedUpData } from "./energy.e2e"
import { e2eEnabled } from "@src/env"

// use different name to avoid conflict with the EnergyService exported from the gameplay module
@Injectable()
export class EnergyService {
    private readonly logger = new Logger(EnergyService.name)

    constructor(
        @InjectQueue(bullData[BullQueueName.Energy].name) private readonly EnergyQueue: Queue,
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
                count = await queryRunner.manager.count(UserEntity, {
                    where: {
                        energyFull: false,
                        createdAt: LessThanOrEqual(utcNow.toDate())
                    }
                })
            
                //get the last scheduled time
                const energyRegenerationLastSchedule = await queryRunner.manager.findOne(KeyValueStoreEntity, {
                    where: {
                        id: KeyValueStoreId.EnergyRegenerationLastSchedule
                    }
                })
                let date: Date 
                if (energyRegenerationLastSchedule) {
                    date = (energyRegenerationLastSchedule.value as EnergyGrowthLastSchedule).date
                }

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
                    const speedUp = await this.cacheManager.get<EnergyCacheSpeedUpData>(ENERGY_CACHE_SPEED_UP)
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
                const jobs = await this.EnergyQueue.addBulk(batches)
                this.logger.verbose(
                    `Added ${jobs.at(0).name} jobs to the regen energy queue. Time: ${time}`
                )

                await queryRunner.startTransaction()
                try {
                    await queryRunner.manager.delete(CollectionEntity, {
                        collection: Collection.EnergySpeedUp
                    })

                    await queryRunner.manager.save(KeyValueStoreEntity, {
                        id: KeyValueStoreId.EnergyRegenerationLastSchedule,
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
