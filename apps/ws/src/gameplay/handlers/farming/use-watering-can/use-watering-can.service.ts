import { Injectable, Logger } from "@nestjs/common"
import { 
    InjectMongoose, 
    InventoryKind, 
    InventorySchema, 
    InventoryTypeId, 
    PlacedItemSchema, 
    PlantCurrentState,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService, SyncService } from "@src/gameplay"
import { StaticService } from "@src/gameplay/static"
import { Connection } from "mongoose"
import { UseWateringCanMessage } from "./use-watering-can.dto"
import { UserLike } from "@src/jwt"
import { createObjectId, DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { WsThrottlerGuard } from "@src/throttler"
import { UseGuards } from "@nestjs/common"

@Injectable()
export class UseWateringCanService {
    private readonly logger = new Logger(UseWateringCanService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    
    @UseGuards(WsThrottlerGuard)
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

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE WATERING CAN TOOL
                 ************************************************************/

                // Check if user has watering can
                const inventoryWateringCanExisted = await this.connection
                    .model<InventorySchema>(InventorySchema.name)
                    .findOne({
                        user: userId,
                        inventoryType: createObjectId(InventoryTypeId.WateringCan),
                        kind: InventoryKind.Tool
                    })
                    .session(session)

                // Validate watering can exists in inventory
                if (!inventoryWateringCanExisted) {
                    throw new WsException("Watering can not found in toolbar")
                }   
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
                // Add to synced placed items
                syncedPlacedItemAction = {
                    id: placedItemTile._id.toString(),
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType
                }
                // Clone for tracking changes
                const placedItemTileSnapshot = placedItemTile.$clone()

                /************************************************************
                 * VALIDATE ENERGY
                 ************************************************************/
                // Check if the user has enough energy
                const { energyConsume, experiencesGain } = this.staticService.activities.useWateringCan
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
                // Update plant state to Normal
                placedItemTile.plantInfo.currentState = PlantCurrentState.Normal

                // Save placed item tile
                await placedItemTile.save({ session })

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

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload
                }
            })

            return result
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