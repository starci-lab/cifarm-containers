import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { MoveRequest } from "./move.dto"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { Connection } from "mongoose"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection
    ) {}

    async move(request: MoveRequest) {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            const placedItem = await this.connection
                .model<PlacedItemSchema>(PlacedItemSchema.name)
                .findById(request.placedItemId)
                .session(mongoSession)
                
            if (!placedItem) throw new GrpcNotFoundException("Placed item not found")

            await this.connection.model<PlacedItemSchema>(PlacedItemSchema.name).updateOne({
                _id: request.placedItemId
            }, {
                x: request.position.x,
                y: request.position.y
            }).session(mongoSession)

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
