import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    InventoryKind,
    InventorySchema,
    InventoryType,
    PlantType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, InventoryService, SyncService, StaticService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyCropSeedsMessage } from "./buy-crop-seeds.dto"
import { UserLike } from "@src/jwt"
import { WithStatus } from "@src/common"
import { SyncedResponse } from "../../types"
import { WsException } from "@nestjs/websockets"

@Injectable()
export class BuyCropSeedsService {
    private readonly logger = new Logger(BuyCropSeedsService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly inventoryService: InventoryService,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService
    ) {}

    async buyCropSeeds({ id: userId }: UserLike, request: BuyCropSeedsMessage): Promise<SyncedResponse> {
        // Start session
        const mongoSession = await this.connection.startSession()

        let syncedUser: WithStatus<UserSchema> | undefined
        const syncedInventories: Array<WithStatus<InventorySchema>> = []
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE CROP
                 ************************************************************/
                const crop = this.staticService.crops.find(
                    (crop) => crop.displayId.toString() === request.cropId
                )

                if (!crop) {
                    throw new WsException("Crop not found")
                }

                if (!crop.availableInShop) {
                    throw new WsException("Crop not available in shop")
                }

                const totalCost = crop.price * request.quantity

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
                        inventoryType.type === InventoryType.Seed &&
                        inventoryType.seedType === PlantType.Crop &&
                        inventoryType.crop.toString() === crop.id.toString()
                )

                if (!inventoryType) {
                    throw new WsException("Inventory crop seed type not found")
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
                 * ADD SEEDS TO INVENTORY
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
