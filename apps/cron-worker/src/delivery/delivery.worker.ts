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
                return
            }

            const users = await queryRunner.manager.find(UserEntity, {
                where: { id: In(userIds) }
            })

            const promises: Array<Promise<void>> = []
            // use for-each to add async function to promises array
            users.forEach((user) => {
                const promise = async () => {
                    const deliveringProducts = await queryRunner.manager.find(DeliveringProductEntity, {
                        where: { userId: user.id },
                        relations: {
                            product: true
                        }
                    })
                    // Calculate total amount of gold and token
                    const totalGoldAmount = deliveringProducts.reduce((sum, deliveringProduct) => {
                        return sum + deliveringProduct.product.goldAmount * deliveringProduct.quantity
                    }, 0)

                    const totalTokenAmount = deliveringProducts.reduce((sum, deliveringProduct) => {
                        return sum + deliveringProduct.product.tokenAmount * deliveringProduct.quantity
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
                    await queryRunner.startTransaction()
                    try {
                        await queryRunner.manager.update(UserEntity, user.id, {
                            ...goldChanged,
                            ...tokenChanged
                        })
                        await queryRunner.manager.delete(DeliveringProductEntity, {
                            userId: user.id
                        })
                        await queryRunner.commitTransaction()
                    } catch (error) {
                        this.logger.error(`Transaction failed: ${error}`)
                        await queryRunner.rollbackTransaction()
                        throw error
                    }
                }
                promises.push(promise())
            })
            await Promise.all(promises)
        } finally {
            await queryRunner.release()
        }
    }
}
