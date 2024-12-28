import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { Job } from "bullmq"
import { DataSource} from "typeorm"
import { DeliverysWorkerProcessTransactionFailedException } from "@src/exceptions"
import { bullConfig, BullQueueName } from "@src/config"
import { DeliveryJobData } from "@apps/cron-scheduler"
import { DeliveringProductEntity, UserEntity } from "@src/databases"
import { GoldBalanceService, TokenBalanceService } from "@src/services"

@Processor(bullConfig[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
    ) {
        super()
    }

    public override async process(job: Job<DeliveryJobData>): Promise<void> {
        this.logger.verbose(`Processing delivery job: ${job.id}`)

        const { skip, take, utcTime } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const userUpdatePromises = []
        const deliveringProductsRemovePromises = []
        
        this.logger.debug(`Processed delivery job: ${job.id}`)
        try {
            const rawUserIds = await queryRunner.manager
                .createQueryBuilder(DeliveringProductEntity, "delivering_products")
                .select("delivering_products.userId", "userId")
                .groupBy("delivering_products.userId")
                .orderBy("delivering_products.userId", "ASC")
                .skip(skip)
                .take(take)
                .getRawMany()

            const userIds = rawUserIds.map((raw) => raw.userId)

            if (!userIds.length) {
                this.logger.verbose("No users to process.")
                return
            }

            userIds.forEach(async (userId) => {
                // Fetch delivering products for the user
                const deliveringProducts = await queryRunner.manager.find(DeliveringProductEntity, {
                    where: { userId },
                    relations: {
                        product: true,
                    }
                })

                if (!deliveringProducts.length) {
                    this.logger.debug(`No delivering products found for user ${userId}`)
                    return
                }

                // Fetch user details
                const user = await queryRunner.manager.findOne(UserEntity, { where: { id: userId } })

                if (!user) {
                    this.logger.warn(`User with ID ${userId} not found.`)
                    return
                }

                // Example logic: calculate total cost
                const totalTokenAmount = deliveringProducts.reduce((sum, deliveringProducts) => {
                    return sum + deliveringProducts.product.tokenAmount * deliveringProducts.quantity
                }, 0)

                // Update user balance via token balance service
                const tokensChanged = this.tokenBalanceService.add({
                    entity: user,
                    amount: totalTokenAmount,
                })

                userUpdatePromises.push(queryRunner.manager.update(UserEntity, user.id, {
                    ...tokensChanged,
                }))

                deliveringProductsRemovePromises.push(
                    queryRunner.manager.delete(DeliveringProductEntity, { userId })
                )

                this.logger.debug(
                    `Processed user ${userId} with ${deliveringProducts.length} delivering products.`
                )
            })


            await queryRunner.startTransaction()
            try {
                await Promise.all(userUpdatePromises)
                await Promise.all(deliveringProductsRemovePromises)
               
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