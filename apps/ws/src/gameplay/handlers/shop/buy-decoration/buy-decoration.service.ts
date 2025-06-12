import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    UserSchema
} from "@src/databases"
import {
    GoldBalanceService,
    StaticService,
    SyncService,
    PositionService,
    LimitService
} from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyDecorationMessage } from "./buy-decoration.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { ActionName, EmitActionPayload } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { StopBuyingResponse } from "../../types"
import { BuyDecorationData } from "./types"

@Injectable()
export class BuyDecorationService {
    private readonly logger = new Logger(BuyDecorationService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService,
        private readonly limitService: LimitService,
    ) {}

    async buyDecoration(
        { id: userId }: UserLike,
        { position, decorationId }: BuyDecorationMessage
    ): Promise<StopBuyingResponse<BuyDecorationData>> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload<BuyDecorationData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        let stopBuying: boolean | undefined

        try {
            const result = await mongoSession.withTransaction(async (session) => {
                // get decoration
                const decoration = this.staticService.decorations.find((decoration) => decoration.displayId === decorationId)
                if (!decoration) {
                    throw new WsException("Decoration not found")
                }

                if (!decoration.availableInShop) {
                    throw new WsException("Decoration not available in shop")
                }

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new WsException("User not found")
                }

                // Save user snapshot
                const userSnapshot = user.$clone()

                // Check if the user has enough gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: decoration.price
                })
                // get placed item type
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) => placedItemType.type === PlacedItemType.Decoration
                    && placedItemType.decoration.toString() === decoration.id.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }
                /************************************************************
                 * CHECK POSITION AVAILABILITY
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
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: decoration.price
                })
                
                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
                /************************************************************
                 * PLACE DECORATION
                 ************************************************************/
                // Save placed item
                const [placedItemDecorationRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                placedItemType: placedItemType.id,
                                position,
                                decoration: decoration.id
                            }
                        ],
                        { session }
                    )
                // get synced placed item
                const createdSyncedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItemDecorationRaw]
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action message to emit to Kafka
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.BuyDecoration,
                    success: true,
                    userId,
                    data: {
                        decorationId: decoration.id
                    }
                }

                // check limit
                const limitData = await this.limitService.getDecorationLimit({
                    decoration,
                    user,
                    session
                })
                stopBuying = !limitData.selectedPlacedItemCountNotExceedLimit || user.golds < decoration.price
                
                // return response
                return {
                    user: syncedUser,
                    placedItems: syncedPlacedItems,
                    action: actionPayload,
                    stopBuying
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
