import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { WithStatus } from "@src/common"
import { PositionService, SyncService, StaticService } from "@src/gameplay"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { MoveMessage } from "./move.dto"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection,
        private readonly syncService: SyncService,
        private readonly staticService: StaticService,
        private readonly positionService: PositionService
    ) {}

    async move(
        { id: userId }: UserLike,
        { placedItemId, position }: MoveMessage
    ): Promise<SyncedResponse> {
        const mongoSession = await this.connection.startSession()
 
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
    
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .session(session)

                if (!placedItem) {
                    throw new WsException("Placed item not found")
                }
                const placedItemSnapshot = placedItem.$clone()

                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.id === placedItem.placedItemType.toString()
                )

                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                if (placedItem.user.toString() !== userId) {
                    throw new WsException("You are not the owner of this placed item")
                }
                /************************************************************
                 * CHECK IF POSITION IS AVAILABLE
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    connection: this.connection,
                    userId
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })

                /************************************************************
                 * UPDATE PLACED ITEM POSITION
                 ************************************************************/
                // Update the placed item position in the database
                placedItem.x = position.x
                placedItem.y = position.y
                await placedItem.save({ session })
                const updatedSyncedPlacedItem = this.syncService.getPartialUpdatedSyncedPlacedItem({
                    placedItemSnapshot,
                    placedItemUpdated: placedItem
                })
                syncedPlacedItems.push(updatedSyncedPlacedItem)  
            })
            return {
                placedItems: syncedPlacedItems
            }
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()  // End the session after the transaction
        }
    }
}
