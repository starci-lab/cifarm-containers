import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource, Not } from "typeorm"
import { v4 } from "uuid"
import { AnimalCurrentState, AnimalInfoEntity } from "@src/database"
import { AnimalJobData } from "./animal.dto"
import { bullConfig, BullQueueName } from "@src/config"

@Injectable()
export class AnimalService {
    private readonly logger = new Logger(AnimalService.name)
    constructor(
        @InjectQueue(bullConfig[BullQueueName.Animal].name) private animalQueue: Queue,
        private readonly dataSource: DataSource
    ) {}

    @Cron("*/1 * * * * *")
    async handle() {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        let count: number
        try {
            count = await queryRunner.manager.count(AnimalInfoEntity, {
                where: {
                    hasYielded: false,
                    currentState: Not(AnimalCurrentState.Hungry)
                }
            })
        } finally {
            await queryRunner.release()
        }

        this.logger.debug(`Found ${count} animals that need to be grown`)
        //split into 10000 per batch
        if (count === 0) {
            this.logger.verbose("No animals to grow")
            return
        }
        const batchSize = bullConfig[BullQueueName.Animal].batchSize
        const batchCount = Math.ceil(count / batchSize)

        // Create batches
        const batches: Array<{
            name: string
            data: AnimalJobData
        }> = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                from: i * batchSize,
                to: Math.min((i + 1) * batchSize, count)
            }
        }))
        this.logger.verbose(`Adding ${batches.length} batches to the queue`)
        await this.animalQueue.addBulk(batches)
    }
}
