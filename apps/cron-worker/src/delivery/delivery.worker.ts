import { DeliveryJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { DeliveringProductEntity, InjectPostgreSQL, UserEntity } from "@src/databases"
import { GoldBalanceService, TokenBalanceService } from "@src/gameplay"
import { Job } from "bullmq"
import { DataSource, In } from "typeorm"

@Processor(bullData[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService
    ) {
        super()
    }

    public override async process(job: Job<DeliveryJobData>): Promise<void> {
        this.logger.verbose(`Processing delivery job: ${job.id}`)

        const { skip, take } = job.data

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
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

            const users = await queryRunner.manager.find(UserEntity, {
                where: { id: In(userIds) }
            })

            users.forEach(async (user) => {
                // Fetch delivering products for the user
                const deliveringProducts = await queryRunner.manager.find(DeliveringProductEntity, {
                    where: { userId: user.id },
                    relations: {
                        product: true
                    }
                })

                // Logic: calculate total amount of tokens to deliver
                const totalGoldAmount = deliveringProducts.reduce((sum, deliveringProducts) => {
                    return sum + deliveringProducts.product.goldAmount * deliveringProducts.quantity
                }, 0)
                
                const totalTokenAmount = deliveringProducts.reduce((sum, deliveringProducts) => {
                    return (
                        sum + deliveringProducts.product.tokenAmount * deliveringProducts.quantity
                    )
                }, 0)

                // Update user balance
                const goldChanged = this.goldBalanceService.add({
                    entity: user,
                    amount: totalGoldAmount
                })
                const tokenChanged = this.tokenBalanceService.add({
                    entity: user,
                    amount: totalTokenAmount
                })


                // Update user's balance
                return {
                    ...user,
                    ...goldChanged,
                    ...tokenChanged
                }
            })

            await queryRunner.startTransaction()
            try {
                await queryRunner.manager.save(users)
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw error
            }
        } finally {
            await queryRunner.release()
        }
    }
}
