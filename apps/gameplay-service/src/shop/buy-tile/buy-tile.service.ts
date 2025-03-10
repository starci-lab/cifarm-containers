import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import { InjectMongoose, PlacedItemSchema, TileSchema, UserSchema } from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { ActionName, EmitActionPayload } from "@apps/io-gameplay"

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async buyTile({ position, tileId, userId }: BuyTileRequest): Promise<BuyTileResponse> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            const result = await mongoSession.withTransaction(async () => {
                // Fetch tile details
                const tile = await this.connection
                    .model<TileSchema>(TileSchema.name)
                    .findById(createObjectId(tileId))
                    .session(mongoSession)

                if (!tile) throw new GrpcNotFoundException("Tile not found")
                if (!tile.availableInShop)
                    throw new GrpcFailedPreconditionException("Tile not available in shop")

                // Fetch user details
                const user = await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .findById(userId)
                    .session(mongoSession)

                // Check sufficient gold
                this.goldBalanceService.checkSufficient({
                    current: user.golds,
                    required: tile.price
                })

                
                // Deduct gold and update the user's gold balance
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: tile.price
                })

                await this.connection
                    .model<UserSchema>(UserSchema.name)
                    .updateOne({ _id: user.id }, { ...goldsChanged })
                    .session(mongoSession)

                // Check the number of tiles owned by the user
                const count = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .countDocuments({
                        user: userId,
                        placedItemType: createObjectId(tileId)
                    })
                    .session(mongoSession)

                if (count >= tile.maxOwnership)
                    throw new GrpcFailedPreconditionException("Max ownership reached")

                // Save the placed item (tile) in the database
                const [placedItemTileRaw] = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .create(
                        [
                            {
                                user: userId,
                                x: position.x,
                                y: position.y,
                                placedItemType: createObjectId(tileId),
                                tileInfo: {}
                            }
                        ],
                        { session: mongoSession }
                    )
                const placedItemTileId = placedItemTileRaw._id.toString()

                // Prepare the action message to emit to Kafka
                actionMessage = {
                    placedItemId: placedItemTileId,
                    action: ActionName.BuyTile,
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
