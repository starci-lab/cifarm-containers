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
        { inventoryId, quantity, index }: DeliverInventoryMessage
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

                /************************************************************
                 * REMOVE SOME QUANTITY FROM SOURCE INVENTORY
                 ************************************************************/
                const { removeInsteadOfUpdate, removedInventory, updatedInventory } =
                    this.inventoryService.removeSingle({
                        inventory: inventory,
                        quantity
                    })

                if (removeInsteadOfUpdate) {
                    await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .deleteMany({
                            _id: { $in: removedInventory._id }
                        })
                        .session(session)
                    const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                        inventoryIds: [removedInventory.id]
                    })
                    syncedInventories.push(...deletedSyncedInventories)
                } else {
                    const { inventorySnapshot, inventoryUpdated } = updatedInventory
                    await inventoryUpdated.save({ session })
                    const syncedInventory = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot,
                        inventoryUpdated
                    })
                    syncedInventories.push(syncedInventory)
                }

                /************************************************************
                 * CREATE DELIVERY INVENTORY
                 ************************************************************/
                // Create a new inventory kind for Delivery
                const createdInventoryRaws = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .create(
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
                const createdSyncedInventories = this.syncService.getCreatedSyncedInventories({
                    inventories: createdInventoryRaws
                })
                syncedInventories.push(...createdSyncedInventories)
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
