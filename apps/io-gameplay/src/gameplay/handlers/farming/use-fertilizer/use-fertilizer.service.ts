import { Injectable, Logger } from "@nestjs/common"
import { 
    InjectMongoose, 
    InventorySchema, 
    InventoryType,
    PlacedItemSchema, 
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseFertilizerMessage } from "./use-fertilizer.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async useFertilizer(
        { id: userId }: UserLike,
        { inventorySupplyId, placedItemTileId }: UseFertilizerMessage
    ): Promise<SyncedResponse> {
        this.logger.debug(`Using fertilizer for user ${userId}, tile ID: ${placedItemTileId}`)

        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        const syncedInventories: Array<WithStatus<InventorySchema>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE USER DATA
                 ************************************************************/
                // Fetch user
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * RETRIEVE AND VALIDATE TILE DATA
                 ************************************************************/
                // Fetch placed item (tile)
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findOne({
                        _id: placedItemTileId,
                        user: userId
                    })
                    .session(session)

                if (!placedItemTile) {
                    throw new WsException("Tile not found")
                }

                // Check if the tile has a plant
                if (!placedItemTile.plantInfo) {
                    throw new WsException("No plant found on this tile")
                }

                // Check if the plant is already fertilized
                if (placedItemTile.plantInfo.isFertilized) {
                    throw new WsException("Plant is already fertilized")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE INVENTORY SUPPLY
                 ************************************************************/
                // Fetch inventory supply (fertilizer)
                const inventorySupply = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        _id: inventorySupplyId,
                        user: userId,
                        inventoryType: InventoryType.Supply
                    })
                    .session(session)

                if (!inventorySupply) {
                    throw new WsException("Fertilizer not found in inventory")
                }

                if (inventorySupply.quantity < 1) {
                    throw new WsException("Not enough fertilizer")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume } = this.staticService.activities.useFertilizer
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * UPDATE USER ENERGY AND EXPERIENCE
                 ************************************************************/
                // Deduct energy
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                // Add experience
                const { experiencesGain } = this.staticService.activities.useFertilizer
                this.levelService.addExperiences({
                    user,
                    experiences: experiencesGain
                })

                // Save user
                await user.save({ session })
                
                // Add to synced user
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * UPDATE INVENTORY
                 ************************************************************/
                // Decrease fertilizer quantity
                inventorySupply.quantity -= 1

                // Save inventory supply
                await inventorySupply.save({ session })

                // Add to synced inventories
                const syncedUpdatedInventories = this.syncService.getCreatedSyncedInventories({
                    inventories: [inventorySupply]
                })
                syncedInventories.push(...syncedUpdatedInventories)

                /************************************************************
                 * UPDATE PLACED ITEM TILE
                 ************************************************************/
                // Update tile with fertilizer information
                placedItemTile.plantInfo.isFertilized = true

                // Save placed item tile
                await placedItemTile.save({ session })

                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemTile._id.toString(),
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    plantInfo: placedItemTile.plantInfo
                }

                const syncedUpdatedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItemTile]
                })
                syncedPlacedItems.push(...syncedUpdatedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.UseFertilizer,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId
                }
            })

            return {
                user: syncedUser,
                placedItems: syncedPlacedItems,
                inventories: syncedInventories,
                action: actionPayload
            }
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
                return {
                    action: actionPayload,
                }
            }

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
} 