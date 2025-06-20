import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { PositionService, SyncService, StaticService } from "@src/gameplay"
import { WsException } from "@nestjs/websockets"
import { SyncedResponse } from "../../types"
import { MoveMessage } from "./move.dto"
import { ActionName } from "../../../emitter"
import { EmitActionPayload } from "../../../emitter"

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
        let actionPayload: EmitActionPayload | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        try {
            const result = await mongoSession.withTransaction(async (session) => {
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
                if (placedItem.x === position.x && placedItem.y === position.y) {
                    throw new WsException("You are already at this position")
                }
                const placedItemSnapshot = placedItem.$clone()
                syncedPlacedItemAction = {
                    x: placedItem.x,
                    y: placedItem.y,
                    placedItemType: placedItem.placedItemType
                }
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
                    userId,
                    session,
                    itself: placedItem
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

                return {
                    placedItems: syncedPlacedItems
                }
            })
            return result
        } catch (error) {
            this.logger.error(error)
            actionPayload = {
                placedItem: syncedPlacedItemAction,
                action: ActionName.Move,
                success: false,
                error: error.message,
                userId
            }
            return {
                action: actionPayload
            }
        } finally {
            await mongoSession.endSession()  // End the session after the transaction
        }
    }
}
