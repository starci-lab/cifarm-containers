import { Injectable, Logger } from "@nestjs/common"
import { DeliverAdditionalInventoryMessage } from "./deliver-additional-inventory.dto"
import { InjectMongoose, InventoryKind, InventorySchema, InventoryType } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { WsException } from "@nestjs/websockets"
import { StaticService, SyncService, InventoryService } from "@src/gameplay"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"

@Injectable()
export class DeliverAdditionalInventoryService {
    private readonly logger = new Logger(DeliverAdditionalInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService
    ) {}

    async deliverAdditionalInventory(
        { id: userId }: UserLike,
        { inventoryId, quantity, index }: DeliverAdditionalInventoryMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

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
                    throw new WsException("Inventory not found")
                }

                /************************************************************
                 * VALIDATE OWNERSHIP AND QUANTITY
                 ************************************************************/

                if (inventory.user.toString() !== userId) {
                    throw new WsException("Delivery product does not belong to user")
                }

                if (inventory.quantity < quantity) {
                    throw new WsException("Not enough quantity to deliver")
                }

                /************************************************************
                 * VALIDATE PRODUCT TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (type) => type.id.toString() === inventory.inventoryType.toString()
                )
                if (inventoryType.type !== InventoryType.Product) {
                    throw new WsException("Inventory is not a product")
                }

                // get inventory delivery from index
                const deliveryInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: inventoryType.id,
                        index,
                        kind: InventoryKind.Delivery
                    })
                    .session(session)

                if (!deliveryInventory) {
                    throw new WsException("Delivery inventory not found")
                }
                /************************************************************
                 * UPDATE SOURCE INVENTORY (PRODUCT)
                 ************************************************************/
                // Remove quantity from inventory
                const { removeInsteadOfUpdate, removedInventory, updatedInventory } =
                    this.inventoryService.removeSingle({
                        inventory,
                        quantity
                    })

                if (removeInsteadOfUpdate) {
                    // Delete the inventory if all quantity is used
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteOne({
                            _id: inventory.id
                        })
                        .session(session)

                    const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                        inventoryIds: [removedInventory.id]
                    })
                    syncedInventories.push(...deletedSyncedInventories)
                } else {
                    // Update the inventory with reduced quantity
                    const { inventorySnapshot, inventoryUpdated } = updatedInventory
                    await inventoryUpdated.save({ session })

                    const syncedInventory = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot,
                        inventoryUpdated
                    })
                    syncedInventories.push(syncedInventory)
                }

                /************************************************************
                 * UPDATE DESTINATION INVENTORY (DELIVERY)
                 ************************************************************/
                // Add quantity to delivery inventory
                const deliveryInventorySnapshot = deliveryInventory.$clone()
                deliveryInventory.quantity += quantity
                await deliveryInventory.save({ session })

                // Add to synced inventories
                const updatedSyncedDeliveryInventory =
                    this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot: deliveryInventorySnapshot,
                        inventoryUpdated: deliveryInventory
                    })
                syncedInventories.push(updatedSyncedDeliveryInventory)
            })

            return {
                inventories: syncedInventories
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
