import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    UserSchema,
} from "@src/databases"
import { GoldBalanceService, InventoryService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuySuppliesMessage } from "./buy-supplies.dto"
import { UserLike } from "@src/jwt"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class BuySuppliesService {
    private readonly logger = new Logger(BuySuppliesService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService
    ) {}

    async buySupplies({ id: userId }: UserLike, request: BuySuppliesMessage): Promise<SyncedResponse> {
        // Start session
        const mongoSession = await this.connection.startSession()

        let syncedUser: WithStatus<UserSchema> | undefined
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE SUPPLY
                 ************************************************************/
                const supply = this.staticService.supplies.find(
                    (supply) => supply.displayId === request.supplyId
                )

                if (!supply) {
                    throw new WsException("Supply not found")
                }

                if (!supply.availableInShop) {
                    throw new WsException("Supply not available in shop")
                }

                const totalCost = supply.price * request.quantity

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

                //Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY TYPE
                 ************************************************************/
                //Get inventory type
                const inventoryType = this.staticService.inventoryTypes.find(
                    (inventoryType) =>
                        inventoryType.type === InventoryType.Supply &&
                        inventoryType.supply.toString() === supply.id.toString()
                )

                if (!inventoryType) {
                    throw new WsException("Inventory supply type not found")
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Subtract gold
                this.goldBalanceService.subtract({
                    user,
                    amount: totalCost
                })

                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * ADD SUPPLIES TO INVENTORY
                 ************************************************************/
                const { occupiedIndexes, inventories } = await this.inventoryService.getAddParams({
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
                    quantity: request.quantity,
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

                return {
                    inventories: syncedInventories,
                    user: syncedUser
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
} 