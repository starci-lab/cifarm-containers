import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron, CronExpression } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { DeliveryJobData, UserWithDeliveringProducts } from "./delivery.dto"
import { DeliveringProductEntity } from "@src/database"
import { bullConfig, BullQueueName } from "@src/config"

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name)

    constructor(
        @InjectQueue(bullConfig[BullQueueName.Delivery].name) private deliveryQueue: Queue,
        private readonly dataSource: DataSource
    ) {}
    

    // @Cron("0 0 * * *", { utcOffset: 7 }) // 00:00 UTC+7
    @Cron("*/1 * * * * *")
    async handle() {
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        let userGroups: Array<UserWithDeliveringProducts> = []

        try {
            this.logger.debug("Fetching distinct users with delivering products.")

            const rawUserGroups = await queryRunner.manager
                .createQueryBuilder(DeliveringProductEntity, "deliveringProduct")
                .select("count(deliveringProduct.id)")
                .groupBy("deliveringProduct.userId")
                .getRawMany()

            userGroups = rawUserGroups.map((raw) => ({
                userId: raw.userId,
                deliveringProducts: raw.deliveringProducts,
            }))
            
            this.logger.debug(`Found ${userGroups.length} users with delivering products.`)

            if (userGroups.length === 0) {
                this.logger.verbose("No users with delivering products to process.")
                return 
            }

        } finally {
            await queryRunner.release()
        }



        //split into 1000 per batch
        const batchSize = bullConfig[BullQueueName.Delivery].batchSize
        const batchCount = Math.ceil(userGroups.length / batchSize)

        // Create batches
        const batches: Array<{
            name: string
            data: DeliveryJobData
        }> = Array.from({ length: batchCount }, (_, i) => ({
            name: v4(),
            data: {
                users: userGroups.slice(i * batchSize, Math.min((i + 1) * batchSize, userGroups.length))
            }
        }))
        this.logger.verbose(`Adding ${batches.length} batches to the queue.`)

        const jobs = await this.deliveryQueue.addBulk(batches)

        this.logger.verbose(
            `Successfully added ${jobs.length} jobs to the queue. First job ID: ${jobs[0]?.name}`
        )
    }
}
