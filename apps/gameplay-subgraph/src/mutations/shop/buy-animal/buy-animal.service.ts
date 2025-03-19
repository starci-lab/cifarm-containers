import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId } from "@src/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService } from "@src/gameplay"
import { Producer } from "kafkajs"
import { Connection } from "mongoose"
import { BuyAnimalRequest } from "./buy-animal.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        private readonly staticService: StaticService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async buyAnimal(
        { id: userId }: UserLike,
        {
            animalId,
            position,
        }: BuyAnimalRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE ANIMAL
                 ************************************************************/
                const animal = this.staticService.animals.find(
                    (animal) => animal.displayId === animalId
                )
                if (!animal) {
                    throw new GraphQLError("Animal not found in static service", {
                        extensions: {
                            code: "ANIMAL_NOT_FOUND_IN_STATIC_SERVICE"
                        }
                    })
                }
                
                if (!animal.availableInShop) {
                    throw new GraphQLError("Animal not available in shop", {
                        extensions: {
                            code: "ANIMAL_NOT_AVAILABLE_IN_SHOP"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE BUILDING AND PLACED ITEM TYPES
                 ************************************************************/
                // Get building for the animal
                const building = this.staticService.buildings.find(
                    (building) => building.animalContainedType === animal.type
                )

                if (!building) {
                    throw new GraphQLError("Building not found for animal type", {
                        extensions: {
                            code: "BUILDING_NOT_FOUND"
                        }
                    })
                }

                // Get placed item types
                const placedItemBuildingType = this.staticService.placedItemTypes.find(
                    (placedItemType) =>
                        placedItemType.type === PlacedItemType.Building &&
                        placedItemType.building.toString() === building.id.toString()
                )
    
                if (!placedItemBuildingType) {
                    throw new GraphQLError("Building type not found", {
                        extensions: {
                            code: "BUILDING_TYPE_NOT_FOUND"
                        }
                    })
                }
                
                const placedItemAnimalType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Animal,
                        animal: animal.id
                    })
                    .session(session)
    
                if (!placedItemAnimalType) {
                    throw new GraphQLError("Animal type not found", {
                        extensions: {
                            code: "ANIMAL_TYPE_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user data
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
                
                // Check if user has enough gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: animal.price
                })

                /************************************************************
                 * CHECK ANIMAL CAPACITY
                 ************************************************************/
                // Get current animal count for the user
                const animalCount = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: placedItemAnimalType
                    })
                    .session(session)

                // Get building placement for capacity calculation
                let maxCapacity = 0
                const placedItemsBuilding = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        user: userId,
                        placedItemType: placedItemBuildingType
                    })
                    .session(session)

                // Calculate max capacity based on upgrades
                for (const placedItemBuilding of placedItemsBuilding) {
                    maxCapacity +=
                        building.upgrades[placedItemBuilding.buildingInfo.currentUpgrade - 1].capacity
                }

                // Ensure the user hasn't reached the max animal capacity
                if (animalCount >= maxCapacity) {
                    throw new GraphQLError("Max capacity reached", {
                        extensions: {
                            code: "MAX_CAPACITY_REACHED"
                        }
                    })
                }

                /************************************************************
                 * UPDATE USER DATA AND PLACE ANIMAL
                 ************************************************************/
                // Deduct gold from user
                this.goldBalanceService.subtract({
                    user,
                    amount: animal.price
                })

                // Save updated user data
                await user.save({ session })

                // Place the animal in the user's farm (at the specified position)
                const [placedItemAnimalRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: placedItemAnimalType,
                                animalInfo: {
                                    animal: createObjectId(animalId)
                                }
                            }
                        ],
                        { session }
                    )

                const placedItemAnimalId = placedItemAnimalRaw._id.toString()

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare action message for Kafka
                actionMessage = {
                    action: ActionName.BuyAnimal,
                    success: true,
                    placedItemId: placedItemAnimalId,
                    userId,
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
            await mongoSession.endSession()
        }
    }
}
