import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import { InjectCache } from "@src/cache"
import { DeliveringProductEntity, InjectPostgreSQL } from "@src/databases"
import { BulkJobOptions, Queue } from "bullmq"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { DeliveryJobData } from "./delivery.dto"
import {
    OnEventLeaderElected,
    OnEventLeaderLost
} from "@src/kubernetes"
import { DateUtcService } from "@src/date"

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name)

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

    constructor(
        @InjectQueue(BullQueueName.Delivery) private readonly deliveryQueue: Queue,
        @InjectCache()
        private readonly cacheManager: Cache,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly dateUtcService: DateUtcService
    ) {}

    @Cron("0 0 * * *", { utcOffset: 7 }) // 00:00 UTC+7
    // @Cron("*/1 * * * * *")
    public async handleDeliveryProducts() {
        if (!this.isLeader) {
            return
        }
        const utcNow = this.dateUtcService.getDayjs()
        // Create a query runner
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const { count } = await queryRunner.manager
                .createQueryBuilder(DeliveringProductEntity, "delivering_products")
                .select("COUNT(DISTINCT delivering_products.userId)", "count")
                .getRawOne()

            if (!count) {
                return
            }

            const batchSize = bullData[BullQueueName.Animal].batchSize
            const batchCount = Math.ceil(count / batchSize)

            const batches: Array<{
                name: string
                data: DeliveryJobData
                opts?: BulkJobOptions
            }> = Array.from({ length: batchCount }, (_, i) => ({
                name: v4(),
                data: {
                    skip: i * batchSize,
                    take: batchSize,
                    utcTime: utcNow.valueOf()
                } as DeliveryJobData,
                opts: bullData[BullQueueName.Delivery].opts
            }))

            this.logger.verbose(`Adding ${batches.length} batches to the queue.`)
            await this.deliveryQueue.addBulk(batches)
        } finally {
            await queryRunner.release()
        }
    }
}
