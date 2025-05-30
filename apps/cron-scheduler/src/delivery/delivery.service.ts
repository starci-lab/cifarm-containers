import { Injectable, Logger } from "@nestjs/common"
import { Cron } from "@nestjs/schedule"
import { bullData, BullQueueName, InjectQueue } from "@src/bull"
import { BulkJobOptions, Queue } from "bullmq"
import { v4 } from "uuid"
import { DeliveryJobData } from "./delivery.dto"
import { DateUtcService } from "@src/date"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"

@Injectable()
export class DeliveryService {
    private readonly logger = new Logger(DeliveryService.name)

    constructor(
        @InjectQueue(BullQueueName.Delivery) private readonly deliveryQueue: Queue<DeliveryJobData>,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly dateUtcService: DateUtcService
    ) {}

    // ping the server every 10 seconds
    @Cron("*/10 * * * * *")
    public async ping() {
        this.logger.verbose("Pinging queue")
        await this.deliveryQueue.add(v4(), {
            ping: true
        })
    }
    
    // deliver at 00:00, 15:00, 30:00, 45:00 each hour UTC+7
    @Cron("0,15,30,45 * * * *")
    //@Cron("0 0 * * *", { utcOffset: 7 }) // 00:00 UTC+7
    public async process() {
        await this.deliver()
    }

    public async deliver() {
        const mongoSession = await this.connection.startSession()
        try {
            const utcNow = this.dateUtcService.getDayjs()

            const count = await this.connection
                .model<UserSchema>(UserSchema.name)
                .countDocuments()
                .session(mongoSession)
            this.logger.verbose(`Found ${count} users that need delivery`)
            if (!count) {
                return
            }
            const batchSize = bullData[BullQueueName.Delivery].batchSize
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

            await this.deliveryQueue.addBulk(batches)
        } catch (error) {
            this.logger.error(error)
        } finally {
            await mongoSession.endSession()
        }
    }
}
