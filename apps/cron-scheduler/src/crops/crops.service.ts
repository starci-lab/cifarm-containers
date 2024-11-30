import { InjectQueue } from "@nestjs/bullmq"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { cropsTimeQueueConstants } from "../app.constant"
import { v4 } from "uuid"
import { CropCurrentState, SeedGrowthInfoEntity } from "@src/database"
import { CropsJobData } from "./crops.dto"
import { CACHE_MANAGER, Cache } from "@nestjs/cache-manager"
import { speedUpConstants } from "@apps/gameplay-service"

@Injectable()
export class CropsService {
    private readonly logger = new Logger(CropsService.name)
    constructor(
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
        @InjectQueue(cropsTimeQueueConstants.name) private cropsQueue: Queue,
        private readonly dataSource: DataSource
    ) {}

    @Cron("*/1 * * * * *")
    async handle() {
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            // query crops that are not fully matured and do not need water
            this.logger.fatal("Checking for crops that need to be grown")
            count = await queryRunner.manager.count(SeedGrowthInfoEntity, {
                where: {
                    fullyMatured: false,
                    currentState: Not(CropCurrentState.NeedWater)
                }
            })
        } finally {
            await queryRunner.release()
        }

        this.logger.debug(`Found ${count} crops that need to be grown`)
        if (count === 0) {
            this.logger.verbose("No crops to grow")
            return
        }

        //split into 10000 per batch
        const batchSize = cropsTimeQueueConstants.BATCH_SIZE
        const batchCount = Math.ceil(count / batchSize)

        const value = await this.cacheManager.get(speedUpConstants.key)
        let time = 1
        if (value) {
            // kieemr tra kieu du lieu xem redis luu string hay number
            time += Number(value)
            await this.cacheManager.del(speedUpConstants.key)
        }

        // Create batches
        const batches: Array<{
            name: string
            data: CropsJobData
        }> = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                from: i * batchSize,
                to: Math.min((i + 1) * batchSize, count), // Ensure 'to' does not exceed 'count'
                seconds: time
            }
        }))
        this.logger.verbose(`Adding ${batches.length} batches to the queue`)
        const jobs = await this.cropsQueue.addBulk(batches)
        this.logger.verbose(`Added ${jobs.at(0).name} jobs to the queue`)
    }
}
