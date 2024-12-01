import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { DataSource} from "typeorm"
import { DeliverysWorkerProcessTransactionFailedException } from "@src/exceptions"
import { bullConfig, BullQueueName } from "@src/config"
import { DeliveryJobData } from "@apps/cron-scheduler"
import { DeliveringProductEntity } from "@src/database"

@Processor(bullConfig[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(private readonly dataSource: DataSource) {
        super()
    }

    public override async process(job: Job<DeliveryJobData>): Promise<void> {
        this.logger.verbose(`Processing delivery job: ${job.id}`)
        const { 
            userIds,
            utcTime
        } = job.data

        console.log(userIds)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const promises: Array<Promise<void>> = []
        for (const userId of userIds) {
            promises.push(
                (async () => {
                    // Do something with user
                    const deliveringProducts = await queryRunner.manager.find(DeliveringProductEntity, {
                        where: {
                            userId
                        },
                    })
                    //logic handle
                    // 
                })()
            )
        }
        await Promise.all(promises)
        this.logger.debug(`Processed delivery job: ${job.id}`)
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
