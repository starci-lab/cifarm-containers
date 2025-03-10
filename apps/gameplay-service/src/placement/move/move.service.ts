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

        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async () => {
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(request.placedItemId)
                    .session(mongoSession)

                // If the placed item is not found, throw an error
                if (!placedItem) throw new GrpcNotFoundException("Placed item not found")

                // Update the placed item position in the database
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: request.placedItemId },
                        { x: request.position.x, y: request.position.y }
                    )
                    .session(mongoSession)

            })

            return result
        } catch (error) {
            this.logger.error(error)
            throw error
        } finally {
            await mongoSession.endSession()  // End the session after the transaction
        }
    }
}
