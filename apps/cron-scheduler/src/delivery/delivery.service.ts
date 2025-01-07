import { InjectQueue } from "@nestjs/bullmq"
import { Inject, Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { Queue } from "bullmq"
import { DataSource } from "typeorm"
import { v4 } from "uuid"
import { DeliveryJobData } from "./delivery.dto"
import { DeliveringProductEntity, GameplayPostgreSQLService } from "@src/databases"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import { isProduction } from "@src/env"
import { bullData, BullQueueName } from "@src/bull"
import { CACHE_REDIS_MANAGER, CacheKey } from "@src/cache"
import { Cache } from "cache-manager"
dayjs.extend(utc)

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name)
    private readonly dataSource: DataSource

    constructor(
        @InjectQueue(bullData[BullQueueName.Delivery].name) private deliveryQueue: Queue,
        @Inject(CACHE_REDIS_MANAGER) private cacheManager: Cache,
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }
    
    @Cron("*/1 * * * * *")
    public async triggerDeliveryProducts() {
        if (!isProduction()) {
            const hasValue = await this.cacheManager.get<boolean>(CacheKey.DeliverInstantly)
            if (hasValue) {
                await this.cacheManager.del(CacheKey.DeliverInstantly)
                await this.handleDeliveryProducts()
            }
        }
    }
    
    @Cron("0 0 * * *", { utcOffset: 7 }) // 00:00 UTC+7
    // @Cron("*/1 * * * * *")
    public async handleDeliveryProducts() {
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
            
            const batchSize = bullData[BullQueueName.Animal].batchSize
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
