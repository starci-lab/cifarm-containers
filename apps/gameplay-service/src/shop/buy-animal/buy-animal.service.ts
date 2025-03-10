import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    AnimalSchema,
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuyAnimalRequest, BuyAnimalResponse } from "./buy-animal.dto"
import { Producer } from "kafkajs"
import { ActionEmittedMessage, ActionName } from "@apps/io-gameplay"

@Injectable()
export class BuyAnimalService {
    private readonly logger = new Logger(BuyAnimalService.name)

    constructor(
    @InjectMongoose() private readonly connection: Connection,
    private readonly goldBalanceService: GoldBalanceService,
    @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async buyAnimal({
        animalId,
        position,
        userId
    }: BuyAnimalRequest): Promise<BuyAnimalResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: ActionEmittedMessage | undefined
        try {
            const result = await mongoSession.withTransaction(async (session) => {
                const animal = await this.connection
                    .model<AnimalSchema>(AnimalSchema.name)
                    .findById(createObjectId(animalId))
                    .session(session)

                if (!animal) throw new GrpcNotFoundException("Animal not found")
                if (!animal.availableInShop)
                    throw new GrpcFailedPreconditionException("Animal not available in shop")

                // Get building for the animal
                const building = await this.connection
                    .model<BuildingSchema>(BuildingSchema.name)
                    .findOne({ type: animal.type })
                    .session(session)

                // Get placed item types
                const placedItemBuildingType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Building,
                        building: building.id
                    })
                    .session(session)

                const placedItemAnimalType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Animal,
                        animal: animal.id
                    })
                    .session(session)

                // Fetch user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(session)

                if (!user) throw new GrpcNotFoundException("User not found")

                // Check if the user has enough gold
                const totalCost = animal.price
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: totalCost
                })

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
                    throw new GrpcFailedPreconditionException("Max capacity reached")
                }

                // Deduct gold and update the user's gold balance
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: totalCost
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged })
                    .session(session)

                // Fetch the placed item type for the animal
                const placedItemTypeAnimal = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Animal,
                        animal: createObjectId(animalId)
                    })
                    .session(session)

                // Place the animal in the user's inventory (at the specified position)
                const [placedItemAnimalRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: placedItemTypeAnimal,
                                animalInfo: {
                                    animal: createObjectId(animalId)
                                }
                            }
                        ],
                        { session }
                    )

                await mongoSession.commitTransaction()

                const placedItemAnimalId = placedItemAnimalRaw._id.toString()

                // Prepare action message for Kafka
                actionMessage = {
                    action: ActionName.BuyAnimal,
                    success: true,
                    placedItemId: placedItemAnimalId
                }

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

                return {} // Return an empty object (response)
            })

            return result // Return result from the transaction
        } catch (error) {
            this.logger.error(error)

            // Send failure action message if any error occurs
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }

            // Rollback transaction automatically handled by withTransaction
            throw error // Rethrow error to be handled higher up
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
