import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
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

@Injectable()
export class BuyTileService {
    private readonly logger = new Logger(BuyTileService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        private readonly goldBalanceService: GoldBalanceService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async buyTile(request: BuyTileRequest): Promise<BuyTileResponse> {
        this.logger.debug(
            `Buying tile for user ${request.userId}, id: ${request.tileId}, position: (${request.position.x}, ${request.position.y})`
        )

        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()

        try {
            const tile = await this.connection.model<TileSchema>(TileSchema.name)
                .findById(createObjectId(request.tileId))
                .session(mongoSession)

            if (!tile) throw new GrpcNotFoundException("Tile not found")
            if (!tile.availableInShop)
                throw new GrpcFailedPreconditionException("Tile not available in shop")

            const user = await this.connection.model<UserSchema>(UserSchema.name)
                .findById(request.userId)
                .session(mongoSession)

            if (!user) throw new GrpcNotFoundException("User not found")

            // Check sufficient gold
            this.goldBalanceService.checkSufficient({ current: user.golds, required: tile.price })

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
                    user: request.userId,
                    x: request.position.x,
                    y: request.position.y,
                    placedItemType: createObjectId(request.tileId),
                })

                await mongoSession.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await mongoSession.abortTransaction()
                throw error
            }

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await mongoSession.endSession()
        }
    }
}
