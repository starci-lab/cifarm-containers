import { Injectable, Logger } from "@nestjs/common"
import { 
    InjectMongoose, 
    InventorySchema, 
    PlacedItemSchema, 
    PlantCurrentState,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseWateringCanMessage } from "./use-watering-can.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class UseWateringCanService {
    private readonly logger = new Logger(UseWateringCanService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly inventoryService: InventoryService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async useWateringCan(
        { id: userId }: UserLike,
        { placedItemTileId }: UseWateringCanMessage
    ): Promise<SyncedResponse> {
        this.logger.debug(`Using watering can for user ${userId}, tile ID: ${placedItemTileId}`)

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

                // Check if the plant needs water
                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.NeedWater) {
                    throw new WsException("Plant does not need water")
                }

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume } = this.staticService.activities.useWateringCan
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
                const { experiencesGain } = this.staticService.activities.useWateringCan
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
                 * UPDATE PLACED ITEM TILE
                 ************************************************************/
                // Clone for tracking changes
                const placedItemTileSnapshot = placedItemTile.$clone()

                // Update plant state to Normal
                placedItemTile.plantInfo.currentState = PlantCurrentState.Normal

                // Save placed item tile
                await placedItemTile.save({ session })

                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemTile._id.toString(),
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    plantInfo: placedItemTile.plantInfo
                }

                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemTileSnapshot,
                    placedItemUpdated: placedItemTile
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action payload
                actionPayload = {
                    action: ActionName.UseWateringCan,
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
                actionPayload.success = false
                return {
                    action: actionPayload
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