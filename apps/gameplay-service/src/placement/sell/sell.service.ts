import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { SellRequest } from "./sell.dto"

@Injectable()
export class SellService {
    private readonly logger = new Logger(SellService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async sell({ placedItemId, userId }: SellRequest) {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            // Using `withTransaction` for automatic transaction handling
            const result = await mongoSession.withTransaction(async () => {
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .session(mongoSession)

                //check user id
                if (placedItem.user.toString() !== userId) {
                    throw new GrpcNotFoundException("User not match")
                }

                // If the placed item is not found, throw an error
                if (!placedItem) throw new GrpcNotFoundException("Placed item not found")

                // Update the placed item position in the database
                await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .updateOne(
                        { _id: placedItemId },
                    )
                    .session(mongoSession)

                actionMessage = {
                    placedItemId: placedItemId,
                    action: ActionName.Sell,
                    success: true,
                    userId
                }
            })

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
            if (actionMessage) {
                await this.kafkaProducer.send({
                    topic: KafkaTopic.EmitAction,
                    messages: [{ value: JSON.stringify(actionMessage) }]
                })
            }
            
            throw error
        } finally {
            await mongoSession.endSession()  // End the session after the transaction
        }
    }
}
