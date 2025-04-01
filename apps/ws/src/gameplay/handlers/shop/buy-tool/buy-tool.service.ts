import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyToolMessage } from "./buy-tool.dto"
import { UserLike } from "@src/jwt"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class BuyToolService {
    private readonly logger = new Logger(BuyToolService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService
    ) {}

    async buyTool({ id: userId }: UserLike, request: BuyToolMessage): Promise<SyncedResponse> {
        // Start session
        const mongoSession = await this.connection.startSession()

        let syncedUser: WithStatus<UserSchema> | undefined
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE TOOL
                 ************************************************************/
                const tool = this.staticService.tools.find(
                    (tool) => tool.displayId === request.toolId
                )

                if (!tool) {
                    throw new WsException("Tool not found")
                }

                if (!tool.availableInShop) {
                    throw new WsException("Tool not available in shop")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)
      
                if (!user) {
                    throw new WsException("User not found")
                }
                // snapshot the user to keep tracks on user changes
                const userSnapshot = user.$clone()

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tool.price
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) => 
                        inventoryType.type === InventoryType.Tool && 
                        inventoryType.tool.toString() === tool.id.toString()
                )

                if (!inventoryType) {
                    throw new WsException("Inventory tool type not found")
                }

                // Check if user has the tool already
                const userHasTool = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .exists({
                        user: userId,
                        inventoryType: inventoryType.id
                    })
                    .session(session)

                if (userHasTool) {
                    throw new WsException("User already has the tool")
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Subtract gold
                this.goldBalanceService.subtract({
                    user,
                    amount: tool.price
                })

                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * ADD TOOL TO INVENTORY
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
                    connection: this.connection,
                    inventoryType,
                    userId: user.id,
                    session
                })

                const { storageCapacity } = this.staticService.defaultInfo

                //Save inventory
                const { createdInventories, updatedInventories } = this.inventoryService.add({
                    inventoryType,
                    inventories,
                    capacity: storageCapacity,
                    userId: user.id,
                    occupiedIndexes,
                    kind: InventoryKind.Storage
                })

                // Create new inventory items
                if (createdInventories.length > 0) {
                    const createdInventoryRaws = await this.connection
                        .model<InventorySchema>(InventorySchema.name)
                        .create(createdInventories, { session })
                    const createdSyncedInventories = this.syncService.getCreatedSyncedInventories({
                        inventories: createdInventoryRaws
                    })
                    syncedInventories.push(...createdSyncedInventories)
                }

                // Update existing inventory items
                for (const { inventorySnapshot, inventoryUpdated } of updatedInventories) {
                    // save inventory
                    await inventoryUpdated.save({ session })
                    const syncedInventory = this.syncService.getPartialUpdatedSyncedInventory({
                        inventorySnapshot,
                        inventoryUpdated
                    })
                    syncedInventories.push(syncedInventory)
                }
            })
            return {
                inventories: syncedInventories,
                user: syncedUser
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
} 