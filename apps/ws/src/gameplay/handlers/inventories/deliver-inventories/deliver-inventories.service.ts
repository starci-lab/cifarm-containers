import { Injectable, Logger } from "@nestjs/common"
import { DeliverInventoriesMessage } from "./deliver-inventories.dto"
import { InjectMongoose, InventoryKind, InventorySchema, InventoryType } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { WsException } from "@nestjs/websockets"
import { StaticService, SyncService } from "@src/gameplay"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { InventoryService } from "@src/gameplay"
@Injectable()
export class DeliverInventoriesService {
    private readonly logger = new Logger(DeliverInventoriesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService
    ) {}

    async deliverInventories(
        { id: userId }: UserLike,
        { inventoryIds }: DeliverInventoriesMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            // Using withTransaction to manage the transaction
            const result = await mongoSession.withTransaction(async (session) => {
                const inventoryTypes = this.staticService.inventoryTypes.filter(
                    (inventoryType) => inventoryType.type === InventoryType.Product
                )
                // Fetch the user's inventory
                const storageInventories = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .find({
                        _id: { $in: inventoryIds },
                        user: userId,
                        kind: InventoryKind.Storage,
                        inventoryType: {
                            $in: inventoryTypes.map((inventoryType) => inventoryType.id)
                        }
                    })
                    .session(session)

                if (storageInventories.length !== inventoryIds.length) {
                    throw new WsException("Some inventory(s) not found or not belong to user")
                }

                await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .deleteMany({
                        _id: { $in: inventoryIds }
                    })
                    .session(session)
                const deletedSyncedInventories = this.syncService.getDeletedSyncedInventories({
                    inventoryIds: inventoryIds
                })
                syncedInventories.push(...deletedSyncedInventories)

                // Create a new delivery inventories
                for (const storageInventory of storageInventories) {
                    const inventoryType = this.staticService.inventoryTypes.find(
                        (inventoryType) => inventoryType.id === storageInventory.inventoryType.toString()
                    )
                    const { inventories, occupiedIndexes } =
                        await this.inventoryService.getAddParams({
                            // connection: this.connection,
                            inventoryType: inventoryType,
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
                        quantity: storageInventory.quantity
                    })

                    if (createdInventories.length > 0) {
                        const createdInventoryRaws = await this.connection
                            .model<InventorySchema>(InventorySchema.name)
                            .create(createdInventories, { session })

                        syncedInventories.push(
                            ...this.syncService.getCreatedSyncedInventories({
                                inventories: createdInventoryRaws
                            })
                        )
                    }

                    if (updatedInventories.length > 0) {
                        const { inventorySnapshot, inventoryUpdated } = updatedInventories[0]
                        await inventoryUpdated.save({ session })
                        const updatedSyncedInventory =
                            this.syncService.getPartialUpdatedSyncedInventory({
                                inventorySnapshot,
                                inventoryUpdated
                            })
                        syncedInventories.push(updatedSyncedInventory)
                    }
                }

                return {
                    inventories: syncedInventories
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)
            // Rethrow error to be handled higher up
            throw error
        } finally {
            await mongoSession.endSession() // Ensure the session is closed
        }
    }
}
