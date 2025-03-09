import { Injectable, Logger } from "@nestjs/common"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { createObjectId, GrpcFailedPreconditionException } from "@src/common"
import {
    InjectMongoose,
    PlacedItemSchema,
    TileSchema,
    UserSchema
} from "@src/databases"
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
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async buyTile({ position, tileId, userId}: BuyTileRequest): Promise<BuyTileResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        let actionMessage: EmitActionPayload | undefined
        try {
            const tile = await this.connection.model<TileSchema>(TileSchema.name)
                .findById(createObjectId(tileId))
                .session(mongoSession)

            if (!tile) throw new GrpcNotFoundException("Tile not found")
            if (!tile.availableInShop)
                throw new GrpcFailedPreconditionException("Tile not available in shop")

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: tile.price })

            const count = await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name)
                .countDocuments({
                    user: userId,
                    placedItemType: createObjectId(tileId)
                })
                .session(mongoSession)

            if (count >= tile.maxOwnership)
                throw new GrpcFailedPreconditionException("Max ownership reached")

            try {
                // Subtract gold
                const goldsChanged = this.goldBalanceService.subtract({
                    user: user,
                    amount: tile.price
                })

                await this.connection.model<UserSchema>(UserSchema.name).updateOne(
                    { _id: user.id },
                    { ...goldsChanged }
                )

                // Save the placed item in the database
                await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
                    user: userId,
                    x: position.x,
                    y: position.y,
                    placedItemType: createObjectId(tileId),
                    tileInfo: {}
                })

                await mongoSession.commitTransaction()

                actionMessage = {
                    placedItemId: tileId,
                    action: ActionName.BuyTile,
                    success: true,
                    userId,
                }
                this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [
                        {
                            value: JSON.stringify(actionMessage)
                        }
                    ]
                })
                this.kafkaProducer.send({
                    topic: KafkaTopic.SyncPlacedItems,
                    messages: [
                        {
                            value: JSON.stringify({ userId })
                        }
                    ]
                })
            } catch (error) {
                this.logger.error(error)
                if (actionMessage) {
                    this.kafkaProducer.send({
                        topic: KafkaTopic.EmitAction,
                        messages: [
                            {
                                value: JSON.stringify(actionMessage)
                            }
                        ]
                    })
                }
                await mongoSession.abortTransaction()
                throw error
            }
            return {}
        } finally {
            await mongoSession.endSession()
        }
    }
}
