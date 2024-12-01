import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { DataSource} from "typeorm"
import { DeliverysWorkerProcessTransactionFailedException } from "@src/exceptions"
import { bullConfig, BullQueueName } from "@src/config"
import { DeliveryJobData } from "@apps/cron-scheduler"

@Processor(bullConfig[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(private readonly dataSource: DataSource) {
        super()
    }

    public override async process(job: Job<DeliveryJobData>): Promise<void> {
        this.logger.verbose(`Processing delivery job: ${job.id} - data: ${JSON.stringify(job.data)}`)
        const { 
            users
        } = job.data

        console.log(users)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            

            await queryRunner.startTransaction()
            try {

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new DeliverysWorkerProcessTransactionFailedException(error)
            }
        } finally {
            await queryRunner.release()
        }
    }
}
