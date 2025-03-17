import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId } from "@src/common"
import {
    DefaultInfo,
    InjectMongoose,
    KeyValueRecord,
    PlacedItemSchema,
    SystemId,
    SystemSchema,
    TileSchema,
    UserSchema
} from "@src/databases"
import { GoldBalanceService } from "@src/gameplay"
import { Connection } from "mongoose"
import { BuyTileRequest } from "./buy-tile.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"
@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectMongoose() private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async buyTile(
        { id: userId }: UserLike,
        { position, tileId }: BuyTileRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()

        let actionMessage: EmitActionPayload | undefined
        try {
            await mongoSession.withTransaction(async () => {
                // Fetch tile details
                const tile = await this.connection
                    .model<TileSchema>(TileSchema.name)
                    .findById(createObjectId(tileId))
                    .session(mongoSession)

                if (!tile) throw new GraphQLError("Tile not found", {
                    extensions: {
                        code: "TILE_NOT_FOUND",
                    }
                })
                if (!tile.availableInShop)
                    throw new GraphQLError("Tile not available in shop", {
                        extensions: {
                            code: "TILE_NOT_AVAILABLE_IN_SHOP",
                        }
                    })

                const {
                    value: { tileLimit }
                } = await this.connection
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

                if (count >= tileLimit) throw new GraphQLError("Max ownership reached", {
                    extensions: {
                        code: "MAX_OWNERSHIP_REACHED",
                    }
                })

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

                // No return value needed for void
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
