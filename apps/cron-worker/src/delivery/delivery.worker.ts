import { DeliveryJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { bullData, BullQueueName } from "@src/bull"
import { InjectMongoose, InventoryKind, InventorySchema, InventoryType, InventoryTypeSchema, ProductSchema, UserSchema } from "@src/databases"
import { GoldBalanceService, TokenBalanceService } from "@src/gameplay"
import { Job } from "bullmq"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService
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

        const inventoryTypes = await this.connection
            .model<InventoryTypeSchema>(InventoryTypeSchema.name)
            .find({
                type: InventoryType.Product
            })

        const promises: Array<Promise<void>> = []
        // use for-each to add async function to promises array
        users.forEach((user) => {
            const promise = async () => {
                const session = await this.connection.startSession()
                try {
                    const deliveringInventories = await this.connection.model<InventorySchema>(InventorySchema.name)
                        .find({
                            user: user.id,
                            kind: InventoryKind.Delivery
                        })

                    let totalGoldAmount = 0
                    let totalTokenAmount = 0
                    for (const inventory of deliveringInventories) {
                        const inventoryType = inventoryTypes.find((inventoryType) => inventoryType.id === inventory.inventoryType)
                        if (!inventoryType) {
                            throw new Error(`Inventory type not found: ${inventory.inventoryType}`)
                        }
                        const product = await this.connection.model<ProductSchema>(ProductSchema.name).findById(inventoryType.product).session(session)
                        if (!product) {
                            throw new Error(`Product not found: ${inventoryType.product}`)
                        }
                        totalGoldAmount += product.goldAmount * inventory.quantity
                        totalTokenAmount += product.tokenAmount * inventory.quantity
                    }
                    // Update user balance
                    const goldChanged = this.goldBalanceService.add({
                        user,
                        amount: totalGoldAmount
                    })
                    const tokenChanged = this.tokenBalanceService.add({
                        user,
                        amount: totalTokenAmount
                    })

                    // delete delivering products
                    await this.connection.model<InventorySchema>(InventorySchema.name).deleteMany({
                        user: user.id,
                        kind: InventoryKind.Delivery
                    }).session(session)
                    // update user's balance
                    await this.connection.model<UserSchema>(UserSchema.name).updateOne({
                        _id: user.id
                    }, {
                        ...goldChanged,
                        ...tokenChanged
                    }).session(session)
                } catch (error) {
                    this.logger.error(error)
                    throw error
                } finally {
                    session.endSession()
                }
            }
            promises.push(promise())   
        })
    }
}
