import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import {
    CropCurrentState,
    CropGrowthLastSchedule,
    InjectPostgreSQL,
    SeedGrowthInfoEntity,
    KeyValueStoreEntity,
    KeyValueStoreId
} from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { DataSource, LessThanOrEqual, Not } from "typeorm"
import { v4 } from "uuid"
import { CropJobData } from "./crop.dto"
import { OnEventLeaderElected, OnEventLeaderLost } from "@src/kubernetes"
import { DateUtcService } from "@src/date"
import { InjectCache } from "@src/cache"
import { Cache } from "cache-manager"
import { CACHE_SPEED_UP, CacheSpeedUpData } from "./crop.e2e"
import { e2eEnabled } from "@src/env"

@Injectable()
export class CropService {
    private readonly logger = new Logger(CropService.name)
    constructor(
        @InjectQueue(BullQueueName.Crop) private readonly cropQueue: Queue,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
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
    async handle() {
        if (!this.isLeader) {
            return
        }
        const utcNow = this.dateUtcService.getDayjs()
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            // query crops that are not fully matured and do not need water
            //this.logger.fatal("Checking for crops that need to be grown")
            count = await queryRunner.manager.count(SeedGrowthInfoEntity, {
                where: {
                    //Not fully matured and need water
                    currentState:
                        Not(CropCurrentState.FullyMatured) && Not(CropCurrentState.NeedWater),
                    createdAt: LessThanOrEqual(this.dateUtcService.getDayjs(utcNow).toDate())
                }
            })
 
            //get the last scheduled time, get from db not cache
            const cropGrowthLastSchedule = await queryRunner.manager.findOne(KeyValueStoreEntity, {
                where: {
                    id: KeyValueStoreId.CropGrowthLastSchedule
                }
            })
            let date: Date
            if (cropGrowthLastSchedule) {
                date = (cropGrowthLastSchedule.value as CropGrowthLastSchedule).date
            }

            // this.logger.debug(`Found ${count} crops that need to be grown`)
            if (count !== 0) {
            //split into 10000 per batch
                const batchSize = bullData[BullQueueName.Crop].batchSize
                const batchCount = Math.ceil(count / batchSize)

                let time = date ? utcNow.diff(date, "milliseconds") / 1000.0 : 1
                
                //e2e code block for e2e purpose-only
                if (e2eEnabled()) {
                    const speedUp = await this.cacheManager.get<CacheSpeedUpData>(CACHE_SPEED_UP)
                    if (speedUp) {
                        time += speedUp.time
                        await this.cacheManager.del(CACHE_SPEED_UP)
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

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(KeyValueStoreEntity, {
                    id: KeyValueStoreId.CropGrowthLastSchedule,
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
