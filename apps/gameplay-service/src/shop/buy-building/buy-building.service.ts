import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    BuildingSchema,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemInfo,
    PlacedItemSchema,
    PlacedItemType,
    PlacedItemTypeSchema,
    SystemId,
    SystemSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuyBuildingRequest, BuyBuildingResponse } from "./buy-building.dto"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Producer } from "kafkajs"

@Injectable()
export class BuyBuildingService {
    private readonly logger = new Logger(BuyBuildingService.name)

    constructor(
    @InjectMongoose() private readonly connection: Connection,
    private readonly goldBalanceService: GoldBalanceService,
    @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async buyBuilding({
        buildingId,
        position,
        userId
    }: BuyBuildingRequest): Promise<BuyBuildingResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            const result = await mongoSession.withTransaction(async () => {
                // Fetch building details
                const { value: { buildingLimit } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<PlacedItemInfo>>(createObjectId(SystemId.PlacedItemInfo))
                    .session(mongoSession)

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
                    throw new GrpcFailedPreconditionException("Max building ownership reached")
                }
                // filter building with the same type
                const placedItemType = placedItemTypes.find(placedItemType => placedItemType.building === buildingId)
                if (!placedItemType) {
                    throw new GrpcNotFoundException("Placed item type not found")
                }
                const placedItemBuildings = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .find({
                        placedItemType: placedItemType.id,
                    }).session(mongoSession)
                if (placedItemBuildings.length >= building.maxOwnership) {
                    throw new GrpcFailedPreconditionException("Max building ownership reached")
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

                return {} // Return an empty response
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
