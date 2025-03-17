import { DeliveryJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { InjectMongoose, InventoryKind, InventorySchema, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService, TokenBalanceService } from "@src/gameplay"
import { Job } from "bullmq"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService   
    ) {
        super()
    }

    public override async process(job: Job<DeliveryJobData>): Promise<void> {
        this.logger.verbose(`Processing delivery job: ${job.id}`)

        const { skip, take } = job.data

        const users = await this.connection
            .model<UserSchema>(UserSchema.name)
            .find()
            .skip(skip)
            .limit(take)

        if (!users.length) {
            return
        }

        const promises: Array<Promise<void>> = []
        // use for-each to add async function to promises array
        users.forEach((user) => {
            const promise = async () => {
                const mongoSession = await this.connection.startSession()
                try {
                    const deliveringInventories = await this.connection.model<InventorySchema>(InventorySchema.name)
                        .find({
                            user: user.id,
                            kind: InventoryKind.Delivery
                        })

                    let totalGoldAmount = 0
                    let totalTokenAmount = 0
                    for (const inventory of deliveringInventories) {
                        const inventoryType = this.staticService.inventoryTypes.find((inventoryType) => inventoryType.id === inventory.inventoryType.toString())
                        if (!inventoryType) {
                            throw new Error(`Inventory type not found: ${inventory.inventoryType}`)
                        }
                        const product = this.staticService.products.find((product) => product.id === inventoryType.product.toString())
                        if (!product) {
                            throw new Error(`Product not found: ${inventoryType.product}`)
                        }
                        totalGoldAmount += product.goldAmount * inventory.quantity
                        totalTokenAmount += product.tokenAmount * inventory.quantity
                    }
                    // Update user balance
                    this.goldBalanceService.add({
                        user,
                        amount: totalGoldAmount
                    })
                    this.tokenBalanceService.add({
                        user,
                        amount: totalTokenAmount
                    })

                    // delete delivering products
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                        user: user.id,
                        kind: InventoryKind.Delivery
                    }).session(mongoSession)
                    // update user's balance
                    await user.save({ session: mongoSession })
                } catch (error) {
                    this.logger.error(error)
                    throw error
                } finally {
                    mongoSession.endSession()
                }
            }
            promises.push(promise())   
        })
    }
}
