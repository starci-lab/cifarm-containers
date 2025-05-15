import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventorySchema
} from "@src/databases"
import { DeleteInventoryMessage } from "./delete-inventory.dto"
import { UserLike } from "@src/jwt"
import { SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { WithStatus } from "@src/common"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class DeleteInventoryService {
    private readonly logger = new Logger(DeleteInventoryService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService
    ) {}

    async deleteInventory(
        {
            id: userId
        }: UserLike,
        {
            inventoryId
        }: DeleteInventoryMessage): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY
                 ************************************************************/
                const inventory = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findById(inventoryId)
                    .session(session)

                if (!inventory) {
                    throw new WsException("Inventory not found")
                }

                if (inventory.user.toString() !== userId) {
                    throw new WsException("Inventory not belongs to user")
                }

                await inventory.deleteOne({ session })

                const deletedSyncedInventory = this.syncService.getDeletedSyncedInventories({
                    inventoryIds: [inventoryId]
                })
                syncedInventories.push(...deletedSyncedInventory)

                return {
                    inventories: syncedInventories,
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession() // End the session after the transaction
        }
    }
}
