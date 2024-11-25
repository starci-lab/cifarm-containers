import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { cropsTimeQueueConstants } from "../app.constant"
import { v4 } from "uuid"
import { CropCurrentState, SeedGrowthInfoEntity } from "@src/database"

@Injectable()
export class CropService {
    private readonly logger = new Logger(CropService.name)
    constructor(
        @InjectQueue(cropsTimeQueueConstants.NAME) private animalsQueue: Queue,
        private readonly dataSource: DataSource,
    ) {}

    @Cron("*/1 * * * * *")
    async handle() {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        const count = await queryRunner.manager.count(SeedGrowthInfoEntity, {
            where: {
                fullyMatured: false,
                currentState: Not(CropCurrentState.NeedWater),
            }
        })
        this.logger.debug(`Found ${count} crops that need to be grown`)
        //split into 10000 per batch
        const batchSize = cropsTimeQueueConstants.BATCH_SIZE
        const batchCount = Math.ceil(count / batchSize)
        
        // Create batches
        const batches = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                from: i * batchSize,
                to: Math.min((i + 1) * batchSize, count) - 1  // Ensure 'to' does not exceed 'count'
            },
        }))
        this.logger.debug(`Adding ${batches.length} batches to the queue`)
        await this.animalsQueue.addBulk(batches)
    }
}
