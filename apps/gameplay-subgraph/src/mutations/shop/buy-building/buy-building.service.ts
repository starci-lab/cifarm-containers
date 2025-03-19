import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId } from "@src/common"
import { InjectMongoose, PlacedItemSchema, PlacedItemType, UserSchema } from "@src/databases"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { BuyBuildingRequest } from "./buy-building.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class BuyBuildingService {
    private readonly logger = new Logger(BuyBuildingService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly staticService: StaticService
    ) {}

    async buyBuilding(
        { id: userId }: UserLike,
        { buildingId, position }: BuyBuildingRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING
                 ************************************************************/
                // Fetch building details
                const { buildingLimit } = this.staticService.defaultInfo

                const building = this.staticService.buildings.find(
                    (building) => building.displayId === buildingId
                )
                if (!building) {
                    throw new GraphQLError("Building not found", {
                        extensions: {
                            code: "BUILDING_NOT_FOUND"
                        }
                    })
                }

                if (!building.availableInShop) {
                    throw new GraphQLError("Building not available in shop", {
                        extensions: {
                            code: "BUILDING_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) {
                    throw new GraphQLError("User not found", {
                        extensions: {
                            code: "USER_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * CHECK BUILDING LIMITS
                 ************************************************************/
                const totalBuildings = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: {
                            $in: this.staticService.placedItemTypes
                                .filter(
                                    (placedItemType) =>
                                        placedItemType.type === PlacedItemType.Building
                                )
                                .map((placedItemType) => placedItemType.id)
                        }
                    })
                    .session(mongoSession)

                if (totalBuildings >= buildingLimit) {
                    throw new GraphQLError("Max building ownership reached", {
                        extensions: {
                            code: "MAX_BUILDING_OWNERSHIP_REACHED"
                        }
                    })
                }

                // Filter building with the same type
                const placedItemType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Building &&
                        placedItemType.building.toString() === createObjectId(buildingId).toString()
                )

                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND"
                        }
                    })
                }

                const placedItemBuildings = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        user: userId,
                        placedItemType: placedItemType.id
                    })
                    .session(mongoSession)

                if (placedItemBuildings.length >= building.maxOwnership) {
                    throw new GraphQLError("Max building ownership reached", {
                        extensions: {
                            code: "MAX_BUILDING_OWNERSHIP_REACHED"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE AND UPDATE USER GOLD
                 ************************************************************/
                // Calculate total cost
                const totalCost = building.price

                // Check if the user has enough gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

                // Deduct gold
                this.goldBalanceService.subtract({
                    user,
                    amount: totalCost
                })

                // Save updated user data
                await user.save({ session: mongoSession })

                /************************************************************
                 * PLACE BUILDING
                 ************************************************************/
                // Place the building
                const [placedItemBuildingRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: placedItemType.id,
                                buildingInfo: {
                                    building: building.id,
                                    currentUpgrade: 1
                                }
                            }
                        ],
                        { session: mongoSession }
                    )

                const placedItemId = placedItemBuildingRaw._id.toString()

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare action message
                actionMessage = {
                    action: ActionName.BuyBuilding,
                    placedItemId,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * EXTERNAL COMMUNICATION
             * Send notifications after transaction is complete
             ************************************************************/
            // Send Kafka messages
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
            await mongoSession.endSession()
        }
    }
}
