import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService, SyncService, PositionService, LimitService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyTileMessage } from "./buy-tile.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { StopBuyingResponse } from "../../types"
import { BuyTileData } from "./types"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService,
        private readonly limitService: LimitService // LimitService is imported but not used in this code snippet
    ) {}

    async buyTile(
        { id: userId }: UserLike,
        { position, tileId }: BuyTileMessage
    ): Promise<StopBuyingResponse<BuyTileData>> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload<BuyTileData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let stopBuying: boolean | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE TILE
                 ************************************************************/
                // Fetch tile details
                const tile = this.staticService.tiles.find((tile) => tile.displayId === tileId)
                if (!tile) {
                    throw new WsException("Tile not found")
                }

                if (!tile.availableInShop) {
                    throw new WsException("Tile not available in shop")
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                const { tileLimit } = this.staticService.landLimitInfo.landLimits.find(
                    (limit) => limit.index === user.landLimitIndex
                )
                
                // save user snapshot
                const userSnapshot = user.$clone()

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tile.price
                })

                /************************************************************
                 * CHECK TILE LIMITS
                 ************************************************************/
                // Check the number of tiles the user has
                const count = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: tile.id
                    })
                    .session(session)

                if (count >= tileLimit) {
                    throw new WsException("Max tile limit reached")
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: tile.price
                })

                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })

                /************************************************************
                 * PLACE TILE
                 ************************************************************/
                // Check if position is available
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.tile.toString() === tile.id.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    session,
                    userId
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })

                // Save the placed item (tile) in the database
                const [placedItemTileRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: tile.id,
                                tileInfo: {}
                            }
                        ],
                        { session }
                    )
                syncedPlacedItemAction = {
                    id: placedItemTileRaw._id.toString(),
                    x: placedItemTileRaw.x,
                    y: placedItemTileRaw.y,
                    placedItemType: placedItemTileRaw.placedItemType
                }

                const createdSyncedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItemTileRaw]
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action message to emit to Kafka
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.BuyTile,
                    success: true,
                    userId,
                    data: {
                        tileId: tile.id
                    }
                }

                const { placedItemCountNotExceedLimit } = await this.limitService.getTileLimit({
                    user,
                    session
                })
                stopBuying = !placedItemCountNotExceedLimit || user.golds < tile.price

                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload,
                    stopBuying,
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
