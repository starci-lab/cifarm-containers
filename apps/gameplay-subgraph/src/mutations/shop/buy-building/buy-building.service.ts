import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId } from "@src/common"
import {
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema
} from "@src/databases"
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
        {
            buildingId,
            position,
        }: BuyBuildingRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            await mongoSession.withTransaction(async () => {
                // Fetch building details
                const { buildingLimit } = this.staticService.defaultInfo

                const building = await this.connection
                    .model<BuildingSchema>(BuildingSchema.name)
                    .findById(createObjectId(buildingId))
                    .session(mongoSession)

                if (!building) throw new GraphQLError("Building not found", {
                    extensions: {
                        code: "BUILDING_NOT_FOUND",
                    }
                })
                if (!building.availableInShop) throw new GraphQLError("Building not available in shop", {
                    extensions: {
                        code: "BUILDING_NOT_AVAILABLE_IN_SHOP",
                    }
                })
                
                // Calculate total cost
                const totalCost = building.price

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // get users total buildings
                const placedItemTypes = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .find({ type: PlacedItemType.Building })
                    .session(mongoSession)
                const totalBuildings = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({ user: userId, 
                        placedItemType: {
                            $in: placedItemTypes.map(placedItemType => placedItemType.id)
                        }
                    })
                    .session(mongoSession)
                if (totalBuildings >= buildingLimit) {
                    throw new GraphQLError("Max building ownership reached", {
                        extensions: {
                            code: "MAX_BUILDING_OWNERSHIP_REACHED",
                        }
                    })
                }
                // filter building with the same type
                const placedItemType = placedItemTypes.find(placedItemType => placedItemType.building.toString() === createObjectId(buildingId))
                
                if (!placedItemType) {
                    throw new GraphQLError("Placed item type not found", {
                        extensions: {
                            code: "PLACED_ITEM_TYPE_NOT_FOUND",
                        }
                    })
                }
                const placedItemBuildings = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        placedItemType: placedItemType.id,
                    }).session(mongoSession)
                if (placedItemBuildings.length >= building.maxOwnership) {
                    throw new GraphQLError("Max building ownership reached", {
                        extensions: {
                            code: "MAX_BUILDING_OWNERSHIP_REACHED",
                        }
                    })
                }
                // Check if the user has enough gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

                // Deduct gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged }, { session: mongoSession })
                    .session(mongoSession)

                // Place the building
                const [ placedItemBuildingRaw ] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: user.id,
                                x: position.x,
                                y: position.y,
                                placedItemType: createObjectId(buildingId),
                                buildingInfo: {}
                            }
                        ],
                        { session: mongoSession }
                    )

                const placedItemId = placedItemBuildingRaw._id.toString()

                // Prepare action message
                actionMessage = {
                    action: ActionName.BuyBuilding,
                    placedItemId,
                    success: true,
                    userId,
                }

                // No return value needed for void
            })

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

            // No return value needed for void
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            
            throw error // Rethrow error to be handled higher up
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
