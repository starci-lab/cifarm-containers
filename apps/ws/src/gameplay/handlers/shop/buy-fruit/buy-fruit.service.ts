import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema, PlacedItemType, UserSchema } from "@src/databases"
import {
    GoldBalanceService,
    StaticService,
    SyncService,
    PositionService,
    LimitService
} from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyFruitMessage } from "./buy-fruit.dto"
import { UserLike } from "@src/jwt"
import { DeepPartial, WithStatus } from "@src/common"
import { EmitActionPayload, ActionName } from "../../../emitter"
import { WsException } from "@nestjs/websockets"
import { StopBuyingResponse } from "../../types"
import { BuyFruitData } from "./types"

@Injectable()
export class BuyFruitService {
    private readonly logger = new Logger(BuyFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService,
        private readonly limitService: LimitService
    ) {}

    async buyFruit(
        { id: userId }: UserLike,
        { position, fruitId }: BuyFruitMessage
    ): Promise<StopBuyingResponse<BuyFruitData>> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionPayload: EmitActionPayload<BuyFruitData> | undefined
        let syncedUser: DeepPartial<UserSchema> | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        let stopBuying: boolean | undefined
        const syncedPlacedItems: Array<WithStatus<PlacedItemSchema>> = []
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE FRUIT
                 ************************************************************/
                // Fetch fruit details
                const fruit = this.staticService.fruits.find((fruit) => fruit.displayId === fruitId)
                if (!fruit) {
                    throw new WsException("Fruit not found")
                }

                if (!fruit.availableInShop) {
                    throw new WsException("Fruit not available in shop")
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
                const { fruitLimit } = this.staticService.landLimitInfo.landLimits.find(
                    (limit) => limit.index === user.landLimitIndex
                )
                // save user snapshot
                const userSnapshot = user.$clone()
                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: fruit.price
                })

                /************************************************************
                 * CHECK FRUIT LIMITS
                 ************************************************************/
                // Check the number of fruits the user has
                const placedItemTypes = this.staticService.placedItemTypes.filter(
                    (placedItemType) => placedItemType.type === PlacedItemType.Fruit
                )
                const count = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        isStored: {
                            $ne: true
                        },
                        placedItemType: {
                            $in: placedItemTypes.map((placedItemType) => placedItemType.id)
                        }
                    })
                    .session(session)
                
                if (count >= fruitLimit) {
                    throw new WsException("Max fruit limit reached")
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: fruit.price
                })
                
                // Save updated user data
                await user.save({ session })
                syncedUser = this.syncService.getPartialUpdatedSyncedUser({
                    userSnapshot,
                    userUpdated: user
                })
                /************************************************************
                 * PLACE FRUIT
                 ************************************************************/
                // Find the correct placed item type for this fruit
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Fruit &&
                        placedItemType.fruit.toString() === fruit.id.toString()
                )
                if (!placedItemType) {
                    throw new WsException("Placed item type not found")
                }

                /************************************************************
                 * CHECK IF POSITION IS AVAILABLE
                 ************************************************************/
                const occupiedPositions = await this.positionService.getOccupiedPositions({
                    session,
                    userId
                })
                this.positionService.checkPositionAvailable({
                    position,
                    placedItemType,
                    occupiedPositions
                })

                // Save the placed item (fruit) in the database
                const [placedItemFruitRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: placedItemType.id,
                                fruitInfo: {}
                            }
                        ],
                        { session }
                    )
                syncedPlacedItemAction = {
                    id: placedItemFruitRaw._id.toString(),
                    x: placedItemFruitRaw.x,
                    y: placedItemFruitRaw.y,
                    placedItemType: placedItemFruitRaw.placedItemType
                }

                const createdSyncedPlacedItems = this.syncService.getCreatedSyncedPlacedItems({
                    placedItems: [placedItemFruitRaw]
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action message to emit to Kafka
                actionPayload = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.BuyFruit,
                    success: true,
                    userId,
                    data: {
                        fruitId: fruit.id
                    }
                }

                // check can continue
                const limitResult = await this.limitService.getFruitLimit({
                    session,
                    user
                })
                stopBuying =
                    !limitResult.placedItemCountNotExceedLimit ||
                    user.golds < fruit.price

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
            const actionPayload = {
                placedItem: syncedPlacedItemAction,
                action: ActionName.BuyFruit,
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
