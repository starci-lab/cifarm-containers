import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId } from "@src/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { BuyFruitRequest } from "./buy-fruit.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class BuyFruitService {
    private readonly logger = new Logger(BuyFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly staticService: StaticService
    ) {}

    async buyFruit(
        { id: userId }: UserLike,
        { position, fruitId }: BuyFruitRequest
    ): Promise<void> {
        const session = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            await session.withTransaction(async (session) => {
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
                const user = await this.connection
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
                        placedItemType.fruit.toString() === createObjectId(fruit.id).toString()
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
                const placedItemId = placedItemFruitRaw._id.toString()

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare the action message to emit to Kafka
                actionMessage = {
                    placedItemId,
                    action: ActionName.BuyFruit,
                    success: true,
                    userId
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
                    messages: [{ value: JSON.stringify({ userId }) }]
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
            await session.endSession()
        }
    }
}
