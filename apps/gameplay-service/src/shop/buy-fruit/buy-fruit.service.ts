import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { DefaultInfo, FruitSchema, InjectMongoose, KeyValueRecord, PlacedItemSchema, PlacedItemType, PlacedItemTypeSchema, SystemId, SystemSchema, UserSchema } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuyFruitRequest, BuyFruitResponse } from "./buy-fruit.dto"

@Injectable()
export class BuyFruitService {
    private readonly logger = new Logger(BuyFruitService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async buyFruit({ position, fruitId, userId }: BuyFruitRequest): Promise<BuyFruitResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            const result = await mongoSession.withTransaction(async () => {
                // Fetch tile details
                const fruit = await this.connection
                    .model<FruitSchema>(FruitSchema.name)
                    .findById(createObjectId(fruitId))
                    .session(mongoSession)

                if (!fruit) throw new GrpcNotFoundException("Fruit not found")
                if (!fruit.availableInShop)
                    throw new GrpcFailedPreconditionException("Fruit not available in shop")

                const { value: { fruitLimit } } = await this.connection
                    .model<SystemSchema>(SystemSchema.name)
                    .findById<KeyValueRecord<DefaultInfo>>(createObjectId(SystemId.DefaultInfo))
                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: fruit.price
                })
                
                // Deduct gold and update the user's gold balance
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: fruit.price
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged })
                    .session(mongoSession)

                // Check the number of fruits the user has
                const placedItemTypes = await this.connection.
                    model<PlacedItemTypeSchema>(PlacedItemTypeSchema.name)
                    .find({ type: PlacedItemType.Fruit })
                    .session(mongoSession)

                const count = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: {
                            $in: placedItemTypes.map(placedItemType => placedItemType.id)
                        },
                    })
                    .session(mongoSession)

                if (count >= fruitLimit)
                    throw new GrpcFailedPreconditionException("Max fruit limit reached")

                // Save the placed item (fruit) in the database
                const [placedItemFruitRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: createObjectId(fruit.displayId),
                                fruitInfo: {
                                    fruit: fruit.id,
                                },
                            }
                        ],
                        { session: mongoSession }
                    )
                const placedItemTileId = placedItemFruitRaw._id.toString()

                // Prepare the action message to emit to Kafka
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.BuyFruit,
                    success: true,
                    userId
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

            return result // Return the result from the transaction
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
