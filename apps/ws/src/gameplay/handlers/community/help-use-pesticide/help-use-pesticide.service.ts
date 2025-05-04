import { Injectable, Logger } from "@nestjs/common"
import { 
    PlantCurrentState,
    InjectMongoose, 
    InventorySchema, 
    InventoryKind,
    InventoryTypeId,
    PlacedItemSchema, 
    UserSchema
} from "@src/databases"
import { 
    EnergyService, 
    LevelService, 
    SyncService 
} from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { HelpUsePesticideMessage } from "./help-use-pesticide.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class HelpUsePesticideService {
    private readonly logger = new Logger(HelpUsePesticideService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async helpUsePesticide(
        { id: userId }: UserLike,
        { placedItemTileId }: HelpUsePesticideMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let watcherUserId: string | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * CHECK IF YOU HAVE PESTICIDE IN TOOLBAR
                 ************************************************************/
                const inventoryPesticideExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.Pesticide),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                if (!inventoryPesticideExisted) {
                    throw new WsException("Pesticide not found in toolbar")
                }
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM TILE
                 ************************************************************/
                // Fetch placed item tile
                const placedItemTile = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemTileId)
                    .session(session)

                if (!placedItemTile) {
                    throw new WsException("Tile not found")
                }

                // Add to synced placed items for action
                syncedPlacedItemAction = {
                    id: placedItemTile.id,
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType
                }

                const placedItemTileSnapshot = placedItemTile.$clone()

                // Validate user doesn't own the tile
                watcherUserId = placedItemTile.user.toString()
                if (watcherUserId === userId) {
                    throw new WsException("Cannot help your own tile")
                }

                // Validate tile has seed growth info
                if (!placedItemTile.plantInfo) {
                    throw new WsException("Tile is not planted")
                }

                // Validate tile needs pesticide
                if (placedItemTile.plantInfo.currentState !== PlantCurrentState.IsInfested) {
                    throw new WsException("Tile does not need pesticide")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Get activity data
                const { energyConsume, experiencesGain } =
                    this.staticService.activities.helpUsePesticide

                // Get user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                const neighbor = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(watcherUserId)
                    .session(session)

                if (!neighbor) {
                    throw new WsException("Neighbor not found")
                }

                if (neighbor.network !== user.network) {
                    throw new WsException("Cannot help neighbor in different network")
                }
                
                // Save user snapshot for sync later
                const userSnapshot = user.$clone()

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                this.energyService.checkSufficient({
                    current: user.energy,
                    required: energyConsume
                })

                /************************************************************
                 * DATA MODIFICATION
                 ************************************************************/
                // Deduct energy
                this.energyService.subtract({
                    user,
                    quantity: energyConsume
                })

                // Add experience
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

                // Apply pesticide to the tile - reset to normal growing state
                placedItemTile.plantInfo.currentState = PlantCurrentState.Normal
                // Save placed item tile
                await placedItemTile.save({ session })

                // Add to synced placed items
                const updatedSyncedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot: placedItemTileSnapshot,
                    placedItemUpdated: placedItemTile
                })
                syncedPlacedItems.push(updatedSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                actionPayload = {
                    action: ActionName.HelpUsePesticide,
                    placedItem: syncedPlacedItemAction,
                    success: true,
                    userId
                }

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload,
                    watcherUserId
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionPayload) {
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