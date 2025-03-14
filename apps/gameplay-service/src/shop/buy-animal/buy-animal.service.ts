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
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"

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

        let actionMessage: EmitActionPayload | undefined
        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                const animal = await this.connection
                    .model<AnimalSchema>(AnimalSchema.name)
                    .findById(createObjectId(animalId))
                    .session(mongoSession)

                if (!animal) throw new GrpcNotFoundException("Animal not found")
                if (!animal.availableInShop)
                    throw new GrpcFailedPreconditionException("Animal not available in shop")

                // Get building for the animal
                const building = await this.connection
                    .model<BuildingSchema>(BuildingSchema.name)
                    .findOne({ type: animal.type })
                    .session(mongoSession)

                // Get placed item types
                const placedItemBuildingType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Building,
                        building: building.id
                    })
                    .session(mongoSession)

                const placedItemAnimalType = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Animal,
                        animal: animal.id
                    })
                    .session(mongoSession)

                // Fetch user data
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                
                // Deduct gold and update the user's gold balance
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: animal.price
                })

                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: animal.price
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged })
                    .session(mongoSession)

                // Get current animal count for the user
                const animalCount = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: placedItemAnimalType
                    })
                    .session(mongoSession)

                // Get building placement for capacity calculation
                let maxCapacity = 0
                const placedItemsBuilding = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        user: userId,
                        placedItemType: placedItemBuildingType
                    })
                    .session(mongoSession)

                // Calculate max capacity based on upgrades
                for (const placedItemBuilding of placedItemsBuilding) {
                    maxCapacity +=
            building.upgrades[placedItemBuilding.buildingInfo.currentUpgrade - 1].capacity
                }

                // Ensure the user hasn't reached the max animal capacity
                if (animalCount >= maxCapacity) {
                    throw new GrpcFailedPreconditionException("Max capacity reached")
                }

                // Fetch the placed item type for the animal
                const placedItemTypeAnimal = await this.connection
                    .model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .findOne({
                        type: PlacedItemType.Animal,
                        animal: createObjectId(animalId)
                    })
                    .session(mongoSession)

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
                        { session: mongoSession }
                    )

                const placedItemAnimalId = placedItemAnimalRaw._id.toString()

                // Prepare action message for Kafka
                actionMessage = {
                    action: ActionName.BuyAnimal,
                    success: true,
                    placedItemId: placedItemAnimalId,
                    userId,
                }

                return {} // Return an empty object (response)
            })

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
