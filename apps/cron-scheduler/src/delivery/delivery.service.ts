import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { deliveryTimeQueueConstants } from "../app.constant"
import { DeliveryJobData } from "./delivery.dto"
import { DeliveringProductEntity } from "@src/database"

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name)

    constructor(
        @InjectQueue(deliveryTimeQueueConstants.NAME) private deliveryQueue: Queue,
        private readonly dataSource: DataSource
    ) {}

    @Cron("0 17 * * *", { timeZone: "Asia/Bangkok" }) // 17:00 GMT+7
    async handle() {
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        let count: number

        try {
            this.logger.debug("Checking for delivering products that need to be sold")

            count = await queryRunner.manager.count(DeliveringProductEntity, {
                order: {
                    createdAt: "ASC"
                },
                where: {}
            })
        } finally {
            await queryRunner.release()
        }

        this.logger.debug(`Found ${count} delivering products that need to be sold`)
        if (count === 0) {
            this.logger.verbose("No delivering products to sell")
            return
        }

        //split into 10000 per batch
        const batchSize = deliveryTimeQueueConstants.BATCH_SIZE
        const batchCount = Math.ceil(count / batchSize)

        // Create batches
        const batches: Array<{
            name: string
            data: DeliveryJobData
        }> = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                from: i * batchSize,
                to: Math.min((i + 1) * batchSize, count) // Ensure 'to' does not exceed 'count'
            }
        }))
        this.logger.verbose(`Adding ${batches.length} batches to the queue`)
        const jobs = await this.deliveryQueue.addBulk(batches)
        this.logger.verbose(`Added ${jobs.at(0).name} jobs to the queue`)
    }
}
