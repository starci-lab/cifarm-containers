import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema
} from "@src/databases"
import { MoveInventoryMessage } from "./move-inventory.dto"
import { UserLike } from "@src/jwt"
import { StaticService, SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { WithStatus } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
@Injectable()
export class MoveInventoryService {
    private readonly logger = new Logger(MoveInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async moveInventory(
        {
            id: userId
        }: UserLike,
        {
            isTool,
            index,
            inventoryId
        }: MoveInventoryMessage): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        console.log(isTool, index, inventoryId)
        // synced variables
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            // Using `withTransaction` for automatic transaction handling
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE CONFIGURATION DATA
                 ************************************************************/
                const { storageCapacity, toolCapacity } = this.staticService.defaultInfo

                /************************************************************
                 * VALIDATE INDEX AND DETERMINE INVENTORY KIND
                 ************************************************************/
                const capacity = isTool ? toolCapacity : storageCapacity
                if (index >= capacity) {
                    throw new WsException("Inventory index is out of range")
                }
                const kind = isTool ? InventoryKind.Tool : InventoryKind.Storage

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY
                 ************************************************************/
                // Get inventory by ID
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(session)

                if (!inventory) {
                    throw new WsException("Inventory not found")
                }

                // Check if the inventory belongs to the user
                if (inventory.user.toString() !== userId) {
                    throw new WsException("Inventory does not belong to user")
                }

                /************************************************************
                 * CHECK IF DESTINATION SLOT IS OCCUPIED
                 ************************************************************/
                // Check if there's an inventory at the target index
                const foundInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        index,
                        kind
                    })
                    .session(session)
                /************************************************************
                 * UPDATE INVENTORY POSITIONS
                 ************************************************************/
                if (foundInventory) {
                    //const inventoryType = inventory.inventoryType as InventoryTypeSchema
                    const inventoryType = this.staticService.inventoryTypes.find(
                        (inventoryType) => inventoryType.id === inventory.inventoryType.toString()
                    )
                    // If the found inventory has the same id, just return
                    if (foundInventory.id === inventoryId) {
                        return {}
                    }

                    // If it has the same type, just update the quantity
                    if (foundInventory.inventoryType.toString() === inventoryType.id) {
                        if (foundInventory.quantity + inventory.quantity <= inventoryType.maxStack) {
                            const foundInventorySnapshot = foundInventory.$clone()
                            // Delete the old inventory
                            await this.connection
                                .model<InventorySchema>(InventorySchema.name)
                                .deleteOne({ _id: inventory.id })
                                .session(session)
                            // Update the quantity of the found inventory
                            foundInventory.quantity += inventory.quantity
                            await foundInventory.save({ session })
                            
                            // sync the inventories
                            const updatedSyncedFoundInventory = this.syncService.getPartialUpdatedSyncedInventory({
                                inventorySnapshot: foundInventorySnapshot,
                                inventoryUpdated: foundInventory
                            })
                            syncedInventories.push(updatedSyncedFoundInventory)

                            const deletedSyncedInventory = this.syncService.getDeletedSyncedInventories({
                                inventoryIds: [inventory.id]
                            })
                            syncedInventories.push(...deletedSyncedInventory)
                        } else {
                            const inventorySnapshot = inventory.$clone()
                            const foundInventorySnapshot = foundInventory.$clone()
                            // Reduce the quantity of the inventory
                            inventory.quantity -= inventoryType.maxStack - foundInventory.quantity
                            foundInventory.quantity = inventoryType.maxStack

                            await inventory.save({ session })
                            await foundInventory.save({ session })
                            
                            const updatedSyncedInventories = [
                                this.syncService.getPartialUpdatedSyncedInventory({
                                    inventorySnapshot: inventorySnapshot,
                                    inventoryUpdated: inventory
                                }),
                                this.syncService.getPartialUpdatedSyncedInventory({
                                    inventorySnapshot: foundInventorySnapshot,
                                    inventoryUpdated: foundInventory
                                })
                            ]
                            syncedInventories.push(...updatedSyncedInventories)
                        }
                    } else {
                        const inventorySnapshot = inventory.$clone()
                        const foundInventorySnapshot = foundInventory.$clone()
                        // Swap the inventory
                        const { index: foundIndex, kind: foundKind } = foundInventory
                        foundInventory.index = inventory.index
                        foundInventory.kind = inventory.kind
                        inventory.index = foundIndex
                        inventory.kind = foundKind

                        await inventory.save({ session })
                        await foundInventory.save({ session })

                        const updatedSyncedInventories = [
                            this.syncService.getPartialUpdatedSyncedInventory({
                                inventorySnapshot: inventorySnapshot,
                                inventoryUpdated: inventory
                            }),
                            this.syncService.getPartialUpdatedSyncedInventory({
                                inventorySnapshot: foundInventorySnapshot,
                                inventoryUpdated: foundInventory
                            })
                        ]
                        syncedInventories.push(...updatedSyncedInventories)
                    }
                } else {
                    const inventorySnapshot = inventory.$clone()
                    // If not, just update the index and kind
                    inventory.index = index
                    inventory.kind = kind
                    await inventory.save({ session })

                    const updatedSyncedInventory = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot: inventorySnapshot,
                        inventoryUpdated: inventory
                    })
                    syncedInventories.push(updatedSyncedInventory)
                }
            })

            console.log(syncedInventories)
            return {
                inventories: syncedInventories,
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
