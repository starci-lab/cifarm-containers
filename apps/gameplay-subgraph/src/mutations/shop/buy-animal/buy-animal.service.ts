import { ActionName, BuyAnimalData, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, WithStatus, DeepPartial, SchemaStatus } from "@src/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService, StaticService, SyncService, PositionService } from "@src/gameplay"
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
        @InjectKafkaProducer() private readonly kafkaProducer: Producer,
        private readonly syncService: SyncService,
        private readonly positionService: PositionService
    ) {}

    async buyAnimal(
        { id: userId }: UserLike,
        { animalId, position }: BuyAnimalRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        // synced variables
        let actionMessage: EmitActionPayload<BuyAnimalData> | undefined
        let user: UserSchema | undefined
        let syncedPlacedItemAction: DeepPartial<PlacedItemSchema> | undefined
        const syncedPlacedItems: Array<DeepPartial<WithStatus<PlacedItemSchema>>> = []

        try {
            await mongoSession.withTransaction(async (session) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE ANIMAL
                 ************************************************************/
                const animal = this.staticService.animals.find(
                    (animal) => animal.displayId === animalId
                )
                if (!animal) {
                    throw new GraphQLError("Animal not found", {
                        extensions: {
                            code: "ANIMAL_NOT_FOUND"
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

                const placedItemType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Animal,
                        animal: animal.id
                    })
                    .session(session)

                if (!placedItemType) {
                    throw new GraphQLError("Animal type not found", {
                        extensions: {
                            code: "ANIMAL_TYPE_NOT_FOUND"
                        }
                    })
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
                 * RETRIEVE AND VALIDATE USER DATA
                 ************************************************************/
                // Fetch user data
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
                        placedItemType
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
                        building.upgrades[placedItemBuilding.buildingInfo.currentUpgrade - 1]
                            .capacity
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
                                placedItemType: placedItemType.id,
                                animalInfo: {
                                    animal: createObjectId(animalId)
                                }
                            }
                        ],
                        { session }
                    )

                syncedPlacedItemAction = {
                    id: placedItemAnimalRaw._id.toString(),
                    x: placedItemAnimalRaw.x,
                    y: placedItemAnimalRaw.y,
                    placedItemType: placedItemAnimalRaw.placedItemType
                }

                const createdSyncedPlacedItems =
                    this.syncService.getCreatedOrUpdatedSyncedPlacedItems({
                        placedItems: [placedItemAnimalRaw],
                        status: SchemaStatus.Created
                    })
                syncedPlacedItems.push(...createdSyncedPlacedItems)

                /************************************************************
                 * PREPARE ACTION MESSAGE
                 ************************************************************/
                // Prepare action message for Kafka
                actionMessage = {
                    action: ActionName.BuyAnimal,
                    success: true,
                    placedItem: syncedPlacedItemAction,
                    userId,
                    data: {
                        price: animal.price
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
                    messages: [
                        { value: JSON.stringify({ userId, placedItems: syncedPlacedItems }) }
                    ]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncUser,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId,
                                user: this.syncService.getSyncedUser(user)
                            })
                        }
                    ]
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
