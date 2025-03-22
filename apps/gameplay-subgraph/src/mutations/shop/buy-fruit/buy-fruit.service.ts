import { ActionName, BuyFruitData, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import {
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService, SyncService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { BuyFruitRequest } from "./buy-fruit.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
import { SchemaStatus, WithStatus } from "@src/common"
import { DeepPartial } from "@src/common"

@Injectable()
export class BuyFruitService {
    private readonly logger = new Logger(BuyFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly staticService: StaticService,
        private readonly syncService: SyncService
    ) {}

    async buyFruit(
        { id: userId }: UserLike,
        { position, fruitId }: BuyFruitRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        // synced variables
        let actionMessage: EmitActionPayload<BuyFruitData> | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE FRUIT
                 ************************************************************/
                // Fetch fruit details
                const fruit = this.staticService.fruits.find(
                    (fruit) => fruit.displayId === fruitId
                )
                if (!fruit) {
                    throw new GraphQLError("Fruit not found in static service", {
                        extensions: {
                            code: "FRUIT_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }
                
                if (!fruit.availableInShop) {
                    throw new GraphQLError("Fruit not available in shop", {
                        extensions: {
                            code: "FRUIT_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                const { fruitLimit } = this.staticService.defaultInfo

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

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
                        placedItemType: {
                            $in: placedItemTypes.map((placedItemType) => placedItemType.id)
                        }
                    })
                    .session(session)

                if (count >= fruitLimit) {
                    throw new GraphQLError("Max fruit limit reached", {
                        extensions: {
                            code: "MAX_FRUIT_LIMIT_REACHED"
                        }
                    })
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
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }

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
                                fruitInfo: {
                                    fruit: fruit.id
                                }
                            }
                        ],
                        { session }
                    )
                syncedPlacedItemAction = {
                    id: placedItemFruitRaw._id.toString(),
                    x: placedItemFruitRaw.x,
                    y: placedItemFruitRaw.y,
                    placedItemType: placedItemFruitRaw.placedItemType,    
                }

                const createdSyncedPlacedItems = this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                    placedItems: [placedItemFruitRaw],
                    status: SchemaStatus.Created
                })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action message to emit to Kafka
                actionMessage = {
                    placedItem: syncedPlacedItemAction,
                    action: ActionName.BuyFruit,
                    success: true,
                    userId,
                    data: {
                        price: fruit.price,
                    }
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Send Kafka messages for success
            await Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId, placedItems: syncedPlacedItems })}]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [{ value: JSON.stringify({ userId, user: this.syncService.getSyncedUser(user) }) }]
                })
            ])
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionMessage) {
                actionMessage.success = false
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // Rethrow error to be handled higher up
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
