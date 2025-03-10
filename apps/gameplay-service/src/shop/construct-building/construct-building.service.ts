import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    BuildingSchema,
    InjectMongoose,
    PlacedItemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { ConstructBuildingRequest, ConstructBuildingResponse } from "./construct-building.dto"
import { ActionEmittedMessage, ActionName } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Injectable()
export class ConstructBuildingService {
    private readonly logger = new Logger(ConstructBuildingService.name)

    constructor(
    @InjectMongoose() private readonly connection: Connection,
    private readonly goldBalanceService: GoldBalanceService,
    @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async constructBuilding({
        buildingId,
        position,
        userId
    }: ConstructBuildingRequest): Promise<ConstructBuildingResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: ActionEmittedMessage | undefined
        try {
            const result = await mongoSession.withTransaction(async () => {
            // Fetch building details
                const building = await this.connection
                    .model<BuildingSchema>(BuildingSchema.name)
                    .findById(createObjectId(buildingId))
                    .session(mongoSession)

                if (!building) throw new GrpcNotFoundException("Building not found")
                if (!building.availableInShop) throw new GrpcFailedPreconditionException("Building not available in shop")

                // Calculate total cost
                const totalCost = building.price

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                if (!user) throw new GrpcNotFoundException("User not found")

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
                    .updateOne({ _id: user.id }, { ...goldsChanged })
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
                    action: ActionName.ConstructBuilding,
                    placedItemId,
                    success: true
                }

                return {} // Return an empty response
            })

            // Send Kafka messages
            Promise.all([
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                }),
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [{ value: JSON.stringify({ userId }) }]
                })
            ])

            return result
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
