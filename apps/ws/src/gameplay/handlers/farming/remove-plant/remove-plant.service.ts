import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    UserSchema,
} from "@src/databases"
import { SyncService } from "@src/gameplay"
import { Connection } from "mongoose"
import { RemovePlantMessage } from "./remove-plant.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { ActionName, EmitActionPayload } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"

@Injectable()
export class RemovePlantService {
    private readonly logger = new Logger(RemovePlantService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly syncService: SyncService
    ) {}

    async removePlant(
        { id: userId }: UserLike,
        { placedItemTileId }: RemovePlantMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionPayload: EmitActionPayload | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined   
        try {
            const result = await mongoSession.withTransaction(async (session) => {
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
                const placedItemTileSnapshot = placedItemTile.$clone()
                
                syncedPlacedItemAction = {
                    id: placedItemTile.id,
                    x: placedItemTile.x,
                    y: placedItemTile.y,
                    placedItemType: placedItemTile.placedItemType,
                }

                // Check if the tile already has a plant
                if (placedItemTile.plantInfo) {
                    throw new WsException("Tile already has a plant")
                }
                /************************************************************
                 * UPDATE PLACED ITEM TILE
                 ************************************************************/
                // Update tile with plant info
                placedItemTile.plantInfo = undefined
                // Save placed item tile
                const savedPlacedItemTile = await placedItemTile.save({ session })
                const syncedUpdatedPlacedItems = this.syncService.getPartialUpdatedSyncedPlacedItem(
                    {
                        placedItemSnapshot: placedItemTileSnapshot,
                        placedItemUpdated: savedPlacedItemTile
                    }
                )
                syncedPlacedItems.push(syncedUpdatedPlacedItems)

                return {
                    placedItems: syncedPlacedItems,
                    action: actionPayload
                }
            })

            return result
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            const actionPayload = {
                placedItem: syncedPlacedItemAction,
                action: ActionName.HarvestPlant,
                success: false,
                error: error.message,
                userId
            }
            return {
                action: actionPayload
            }
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
