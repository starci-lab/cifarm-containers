import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { DeliveryJobData } from "./delivery.dto"
import {
    OnEventLeaderElected,
    OnEventLeaderLost
} from "@src/kubernetes"
import { DateUtcService } from "@src/date"
import { InjectMongoose, InventoryKind, InventorySchema, USER } from "@src/databases"
import { Connection } from "mongoose"

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
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService
    ) {}

    @Cron("*/1 * * * * *")
    showNextDelivery() {
        const nowUtc = this.dateUtcService.getDayjs().utc()
        // Define the target time: 00:00 UTC+7, which is equivalent to 17:00 UTC
        const nextDeliveryUtc = this.dateUtcService.getNextDayMidnightUtc(7) // 00:00 UTC+7, but in UTC 
        //retreive the next delivery cron and subtract the current time
        const differentFromNextDelivery = nextDeliveryUtc.diff(nowUtc, "seconds")
        this.logger.log(`Next delivery is in ${this.dateUtcService.formatTime(differentFromNextDelivery)}`)
    }

    @Cron("0 0 * * *", { utcOffset: 7 }) // 00:00 UTC+7
    public async process() {
        if (!this.isLeader) {
            return
        }
        await this.deliver()
    }

    public async deliver() {
        const mongoSession = await this.connection.startSession()
        try {
            const utcNow = this.dateUtcService.getDayjs()

            const count = await this.connection
                .model<InventorySchema>(InventorySchema.name)
                .distinct(USER)
                .countDocuments({
                    kind: InventoryKind.Delivery
                })
                .session(mongoSession)

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
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
