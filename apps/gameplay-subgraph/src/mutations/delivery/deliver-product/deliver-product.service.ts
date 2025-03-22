import { Injectable, Logger } from "@nestjs/common"
import { DeliverProductRequest } from "./deliver-product.dto"
import { InjectMongoose, InventoryKind, InventorySchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { StaticService, SyncService } from "@src/gameplay"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"
import { WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class DeliverProductService {
    private readonly logger = new Logger(DeliverProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
        private readonly syncService: SyncService
    ) {}

    async deliverProduct(
        { id: userId }: UserLike,
        { inventoryId, quantity, index }: DeliverProductRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []
        try {
            // Using withTransaction to manage the transaction
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY
                 ************************************************************/
                // Fetch the user's inventory
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(session)

                if (!inventory) {
                    throw new GraphQLError("Inventory not found", {
                        extensions: {
                            code: "INVENTORY_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE OWNERSHIP AND QUANTITY
                 ************************************************************/

                if (inventory.user.toString() !== userId) {
                    throw new GraphQLError("Delivery product does not belong to user", {
                        extensions: {
                            code: "UNAUTHORIZED_DELIVERY"
                        }
                    })
                }

                if (inventory.quantity < quantity) {
                    throw new GraphQLError("Not enough quantity to deliver", {
                        extensions: {
                            code: "INSUFFICIENT_QUANTITY"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE PRODUCT TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (type) => type.id.toString() === inventory.inventoryType.toString()
                )
                const productId = inventoryType.product.toString()
                if (!productId) {
                    throw new GraphQLError("The inventory type is not a product", {
                        extensions: {
                            code: "INVALID_INVENTORY_TYPE"
                        }
                    })
                }

                /************************************************************
                 * UPDATE SOURCE INVENTORY
                 ************************************************************/
                // Subtract the quantity from the user's inventory
                if (inventory.quantity === quantity) {
                    // Delete the inventory if all quantity is used
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteOne({
                            _id: inventoryId
                        })
                        .session(session)

                    const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                        inventoryIds: [inventory.id]
                    })
                    syncedInventories.push(...deletedSyncedInventories)
                } else {
                    // Update the inventory with reduced quantity
                    inventory.quantity -= quantity
                    await inventory.save({ session })
                    const updatedSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                        inventories: [inventory],
                        status: SchemaStatus.Updated
                    })
                    syncedInventories.push(...updatedSyncedInventories)
                }

                /************************************************************
                 * CREATE DELIVERY INVENTORY
                 ************************************************************/
                // Create a new inventory kind for Delivery
                const createdInventoryRaws = await this.connection.model<InventorySchema>(InventorySchema.name).create(
                    [
                        {
                            quantity,
                            index,
                            kind: InventoryKind.Delivery,
                            user: userId,
                            inventoryType: inventory.inventoryType
                        }
                    ],
                    { session }
                )
                const createdSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                    inventories: createdInventoryRaws,
                    status: SchemaStatus.Created
                })
                syncedInventories.push(...createdSyncedInventories)
            })
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncInventories,
                    messages: [{ value: JSON.stringify({ userId, inventories: syncedInventories })}]
                })
            ])
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
