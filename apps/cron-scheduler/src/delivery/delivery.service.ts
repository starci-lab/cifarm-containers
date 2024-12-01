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
                .createQueryBuilder()
                .select("user_id")
                .from(DeliveringProductEntity, "delivering_products")
                .groupBy("user_id")
                .having("COUNT(id) > 0")
                .getRawOne()
            
            const batchSize = bullConfig[BullQueueName.Animal].batchSize
            const batchCount = Math.ceil(count / batchSize)

            const promises: Array<Promise<void>> = []
            const batches: Array<{
                name: string
                data: DeliveryJobData
            }> = []

            for (let i = 0; i < batchCount; i++) {
                promises.push(
                    (async () => {
                        const skip = i * batchSize
                        const take = Math.min((i + 1) * batchSize, count)

                        const rawUserIds = await queryRunner.manager
                            .createQueryBuilder()
                            .select("user_id")
                            .from(DeliveringProductEntity, "delivering_products")
                            .groupBy("user_id")
                            .having("COUNT(id) > 0")
                            .skip(skip)
                            .take(take)
                            .getRawMany()   
                        batches.push({
                            name: v4(),
                            data: {
                                userIds: rawUserIds.map((rawUserId) => rawUserId.user_id),
                                utcTime: utcNow.valueOf()
                            }
                        })
                    })()
                )
            }
            await Promise.all(promises)

            this.logger.verbose(`Adding ${batches.length} batches to the queue`)
            await this.deliveryQueue.addBulk(batches)
        } finally {
            await queryRunner.release()
        }
    }
}
