import { InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { DeliveryJobData } from "./delivery.dto"
import { DeliveringProductEntity } from "@src/database"
import { bullConfig, BullQueueName } from "@src/config"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
dayjs.extend(utc)

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name)

    constructor(
        @InjectQueue(bullConfig[BullQueueName.Delivery].name) private deliveryQueue: Queue,
        private readonly dataSource: DataSource
    ) {}
    

    @Cron("0 0 * * *", { utcOffset: 7 }) // 00:00 UTC+7
    public async handle() {
        const utcNow = dayjs().utc()
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            this.logger.debug("Fetching distinct users with delivering products.")

            const { count } = await queryRunner.manager
                .createQueryBuilder(DeliveringProductEntity, "delivering_products")
                .select("COUNT(DISTINCT delivering_products.userId)", "count")
                .getRawOne()

            if (!count) {
                this.logger.verbose("No users to process.")
                return
            }
            
            const batchSize = bullConfig[BullQueueName.Animal].batchSize
            const batchCount = Math.ceil(count / batchSize)

            const batches = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: batchSize,
                    utcTime: utcNow.valueOf(),
                } as DeliveryJobData,
            }))

            this.logger.verbose(`Adding ${batches.length} batches to the queue.`)
            await this.deliveryQueue.addBulk(batches)
        } finally {
            await queryRunner.release()
        }
    }
}
