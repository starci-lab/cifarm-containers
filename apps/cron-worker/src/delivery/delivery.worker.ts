import { DeliveryJobData } from "@apps/cron-scheduler"
import { Processor, WorkerHost } from "@nestjs/bullmq"
import { Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { bullData, BullQueueName } from "@src/bull"
import { WithStatus } from "@src/common"
import { InjectMongoose, InventoryKind, InventorySchema, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService, SyncService, TokenBalanceService } from "@src/gameplay"
import { Job } from "bullmq"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"

@Processor(bullData[BullQueueName.Delivery].name)
export class DeliveryWorker extends WorkerHost {
    private readonly logger = new Logger(DeliveryWorker.name)

    constructor(
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly tokenBalanceService: TokenBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
    ) {
        super()
    }

    public override async process(job: Job<DeliveryJobData>): Promise<void> {
        try {
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
                    let syncedUser: WithStatus<UserSchema>
                    const syncedInventories: Array<WithStatus<InventorySchema>> = []
                    const mongoSession = await this.connection.startSession()
                    try {
                        await mongoSession.withTransaction(async (session) => {
                            const userSnapshot = user.$clone()
                            // Get delivering inventories
                            const deliveringInventories = await this.connection
                                .model<InventorySchema>(InventorySchema.name)
                                .find({
                                    user: user.id,
                                    kind: InventoryKind.Delivery
                                })
                                .session(session)
                            if (!deliveringInventories.length) {
                                return
                            }

                            let totalGoldAmount = 0
                            let totalTokenAmount = 0
                            for (const inventory of deliveringInventories) {
                                const inventoryType = this.staticService.inventoryTypes.find(
                                    (inventoryType) =>
                                        inventoryType.id === inventory.inventoryType.toString()
                                )
                                if (!inventoryType) {
                                    throw new Error(
                                        `Inventory type not found: ${inventory.inventoryType}`
                                    )
                                }
                                const product = this.staticService.products.find(
                                    (product) => product.id === inventoryType.product.toString()
                                )
                                if (!product) {
                                    throw new Error(`Product not found: ${inventoryType.product}`)
                                }
                                totalGoldAmount += (product.goldAmount ?? 0) * inventory.quantity
                                totalTokenAmount += (product.tokenAmount ?? 0) * inventory.quantity
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
                            await this.connection
                                .model<InventorySchema>(InventorySchema.name)
                                .deleteMany({
                                    user: user.id,
                                    kind: InventoryKind.Delivery
                                })
                                .session(session)
                            const deletedInventories = this.syncService.getDeletedSyncedInventories({
                                inventoryIds: deliveringInventories.map((inventory) => inventory.id),
                            })

                            syncedInventories.push(...deletedInventories)
                            // update user's balance
                            await user.save({ session })
                            syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                                userSnapshot,
                                userUpdated: user
                            })
                        })
                        Promise.all([
                            syncedUser &&
                            this.kafkaProducer.send({
                                topic: KafkaTopic.SyncUser,
                                messages: [
                                    { value: JSON.stringify({
                                        userId: user.id,
                                        data: syncedUser
                                    }) 
                                    }
                                ]
                            }),
                            syncedInventories.length > 0 &&
                            this.kafkaProducer.send({
                                topic: KafkaTopic.SyncInventories,
                                messages: [
                                    { value: JSON.stringify({
                                        userId: user.id,
                                        data: syncedInventories
                                    }) 
                                    }
                                ]
                            }),
                        ])
                    } catch (error) {
                        this.logger.error(error)
                        throw error
                    } finally {
                        await mongoSession.endSession()
                    }
                }
                promises.push(promise())
            })

            // Wait for all promises to complete
            await Promise.all(promises)
        } catch (error) {
            this.logger.error(error)
        }
    }
}
