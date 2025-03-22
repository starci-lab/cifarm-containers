import { Injectable, Logger } from "@nestjs/common"
import { DeliverMoreProductRequest } from "./deliver-more-product.dto"
import { InjectMongoose, InventoryKind, InventorySchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { StaticService, SyncService } from "@src/gameplay"
import { KafkaTopic, InjectKafkaProducer } from "@src/brokers"
import { Producer } from "kafkajs"
import { WithStatus, DeepPartial, SchemaStatus } from "@src/common"

@Injectable()
export class DeliverMoreProductService {
    private readonly logger = new Logger(DeliverMoreProductService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async deliverMoreProduct(
        { id: userId }: UserLike,
        { inventoryId, quantity, index }: DeliverMoreProductRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        const syncedInventories: Array<DeepPartial<WithStatus<InventorySchema>>> = []
        try {
            // Using withTransaction to manage the transaction
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE DELIVERY INVENTORY
                 ************************************************************/
                // Fetch the delivery inventory
                const deliveryInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        kind: InventoryKind.Delivery,
                        index
                    })
                    .session(session)

                if (!deliveryInventory) {
                    throw new GraphQLError("Delivery product not found", {
                        extensions: {
                            code: "DELIVERY_PRODUCT_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE SOURCE INVENTORY
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

                if (inventory.quantity < quantity) {
                    throw new GraphQLError("Not enough quantity to deliver", {
                        extensions: {
                            code: "NOT_ENOUGH_QUANTITY_TO_DELIVER"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE PRODUCT TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventory.inventoryType.toString() === inventoryType.id.toString()
                )
                if (!inventoryType) {
                    throw new GraphQLError("Inventory type not found", {
                        extensions: {
                            code: "INVENTORY_TYPE_NOT_FOUND"
                        }
                    })
                }
                if (!inventoryType.product) {
                    throw new GraphQLError("The inventory type is not a product", {
                        extensions: {
                            code: "INVENTORY_TYPE_IS_NOT_A_PRODUCT"
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
                 * UPDATE DELIVERY INVENTORY
                 ************************************************************/
                // Add the quantity to the delivery inventory
                deliveryInventory.quantity += quantity
                await deliveryInventory.save({ session })
                const updatedSyncedInventories = this.syncService.getCreatedOrUpdatedSyncedInventories({
                    inventories: [deliveryInventory],
                    status: SchemaStatus.Updated
                })
                syncedInventories.push(...updatedSyncedInventories)
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
