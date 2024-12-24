import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { AnimalCurrentState, AnimalInfoEntity } from "@src/database"
import { bullConfig, BullQueueName } from "@src/config"

@Injectable()
export class AnimalWorker {
    private readonly logger = new Logger(AnimalWorker.name)
    constructor(
        @InjectQueue(bullConfig[BullQueueName.Animal].name) private animalQueue: Queue,
        private readonly dataSource: DataSource
    ) {}

    @Cron("*/1 * * * * *")
    async handle() {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        const count = await queryRunner.manager.count(AnimalInfoEntity, {
            where: {
                currentState: Not(AnimalCurrentState.Hungry) && Not(AnimalCurrentState.Yield)
            }
        })
        this.logger.debug(`Found ${count} animals that need to be grown`)
        //split into 10000 per batch
        if (count === 0) {
            this.logger.verbose("No animals to grow")
            return
        }
        const batchSize = bullConfig[BullQueueName.Animal].batchSize
        const batchCount = Math.ceil(count / batchSize)

        // Create batches
        const batches = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                from: i * batchSize,
                to: Math.min((i + 1) * batchSize, count) - 1 // Ensure 'to' does not exceed 'count'
            }
        }))
        this.logger.verbose(`Adding ${batches.length} batches to the queue`)
        await this.animalQueue.addBulk(batches)
    }
}
