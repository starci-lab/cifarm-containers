import { Injectable, Logger } from "@nestjs/common"
import { DeliverInventoryMessage } from "./deliver-inventory.dto"
import { InjectMongoose, InventoryKind, InventorySchema, InventoryType } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { WsException } from "@nestjs/websockets"
import { StaticService, SyncService } from "@src/gameplay"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { InventoryService } from "@src/gameplay"
@Injectable()
export class DeliverInventoryService {
    private readonly logger = new Logger(DeliverInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService
    ) {}

    async deliverInventory(
        { id: userId }: UserLike,
        { inventoryId }: DeliverInventoryMessage
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


                /************************************************************
                 * VALIDATE PRODUCT TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (type) => type.id.toString() === inventory.inventoryType.toString()
                )
                if (inventoryType.type !== InventoryType.Product) {
                    throw new WsException("Inventory is not a product")
                }

                /************************************************************
                 * REMOVE SOME QUANTITY FROM SOURCE INVENTORY
                 ************************************************************/
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteOne({
                        _id: inventoryId
                    })
                    .session(session)
                const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                    inventoryIds: [inventoryId]
                })
                syncedInventories.push(...deletedSyncedInventories)

                /************************************************************
                 * CREATE DELIVERY INVENTORY
                 ************************************************************/
                // Create a new inventory kind for Delivery
                const { inventories, occupiedIndexes } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session,
                    kind: InventoryKind.Delivery
                })
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventories,
                    occupiedIndexes,
                    inventoryType,
                    userId,
                    capacity: this.staticService.defaultInfo.storageCapacity,
                    kind: InventoryKind.Delivery,
                    quantity: inventory.quantity
                })

                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })

                    syncedInventories.push(...this.syncService.getCreatedSyncedInventories({
                        inventories: createdInventoryRaws
                    }))
                }

                if (updatedInventories.length > 0) {
                    const { inventorySnapshot, inventoryUpdated } = updatedInventories[0]
                    await inventoryUpdated.save({ session })
                    const updatedSyncedInventory = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot,
                        inventoryUpdated
                    })
                    syncedInventories.push(updatedSyncedInventory)
                }
            })

            return {
                inventories: syncedInventories
            }
        } catch (error) {
            this.logger.error(error)
            // Rethrow error to be handled higher up
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
