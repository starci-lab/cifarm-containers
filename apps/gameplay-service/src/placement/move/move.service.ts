import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { MoveRequest } from "./move.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { Connection } from "mongoose"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async move({ placedItemId, position, userId }: MoveRequest) {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const placedItem = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(placedItemId)
                .session(mongoSession)
                
            if (!placedItem) throw new GrpcNotFoundException("Placed item not found")

            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne({
                _id: placedItemId
            }, {
                x: position.x,
                y: position.y
            }).session(mongoSession)

            this.clientKafka.emit(KafkaPattern.SyncPlacedItems, { userId })

            await mongoSession.commitTransaction()
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
