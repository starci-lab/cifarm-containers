import { Injectable, Logger } from "@nestjs/common"
import { MoveInventoryWholesaleMarketMessage } from "./move-inventory-wholesale-market.dto"
import { 
    InjectMongoose, 
    InventoryKind, 
    InventorySchema 
} from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { WsException } from "@nestjs/websockets"
import { 
    StaticService, 
    SyncService 
} from "@src/gameplay"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { InventoryService } from "@src/gameplay"

@Injectable()
export class MoveInventoryWholesaleMarketService {
    private readonly logger = new Logger(MoveInventoryWholesaleMarketService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly inventoryService: InventoryService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async moveInventoryWholesaleMarket(
        { id: userId }: UserLike,
        { inventoryId }: MoveInventoryWholesaleMarketMessage
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
                // Fetch the wholesale market inventory
                const wholesaleMarketInventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(session)

                if (!wholesaleMarketInventory) {
                    throw new WsException("Inventory not found")
                }

                if (wholesaleMarketInventory.user.toString() !== userId) {
                    throw new WsException("Inventory does not belong to user")
                }

                if (wholesaleMarketInventory.kind !== InventoryKind.WholesaleMarket) {
                    throw new WsException("Inventory is not a wholesale market inventory")
                }

                // Create a new inventory with the same properties but change kind to Storage
                const inventoryType = this.staticService.inventoryTypes.find(
                    (type) => type.id === wholesaleMarketInventory.inventoryType.toString()
                )
                if (!inventoryType) {
                    throw new WsException("Inventory type not found")
                }
                const { inventories, occupiedIndexes } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId,
                    session,
                    kind: InventoryKind.Storage
                })
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventories,
                    occupiedIndexes,
                    inventoryType,
                    userId,
                    capacity: this.staticService.defaultInfo.storageCapacity,
                    kind: InventoryKind.Storage,
                    quantity: wholesaleMarketInventory.quantity
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

                /************************************************************
                 * DELETE WHOLESALE MARKET INVENTORY
                 ************************************************************/
                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteOne({
                        _id: wholesaleMarketInventory.id
                    })
                    .session(session)

                // Add to synced inventories
                const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                    inventoryIds: [wholesaleMarketInventory.id]
                })
                syncedInventories.push(...deletedSyncedInventories)

                /************************************************************
                 * CREATE PRODUCT INVENTORY
                 ************************************************************/
                const productId = inventoryType.product?.toString()
                if (!productId) {
                    throw new WsException("The inventory type is not a product")
                }
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