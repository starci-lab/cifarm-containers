import { ActionName, EmitActionPayload } from "@apps/io-gameplay"
import { Injectable, Logger } from "@nestjs/common"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { InjectMongoose, PlacedItemSchema } from "@src/databases"
import { Connection } from "mongoose"
import { MoveRequest } from "./move.dto"
import { UserLike } from "@src/jwt"
import { GraphQLError } from "graphql"

@Injectable()
export class MoveService {
    private readonly logger = new Logger(MoveService.name)

    constructor(
        @InjectMongoose() 
        private readonly connection: Connection,
        @InjectKafkaProducer() private readonly kafkaProducer: Producer
    ) {}

    async move(
        { id: userId }: UserLike,
        { placedItemId, position }: MoveRequest
    ): Promise<void> {
        const mongoSession = await this.connection.startSession()
        let actionMessage: EmitActionPayload | undefined

        try {
            await mongoSession.withTransaction(async (mongoSession) => {
                /************************************************************
                 * RETRIEVE AND VALIDATE PLACED ITEM
                 ************************************************************/
                const placedItem = await this.connection
                    .model<PlacedItemSchema>(PlacedItemSchema.name)
                    .findById(placedItemId)
                    .session(mongoSession)

                if (!placedItem) {
                    throw new GraphQLError("Placed item not found", {
                        extensions: {
                            code: "PLACED_ITEM_NOT_FOUND"
                        }
                    })
                }

                /************************************************************
                 * VALIDATE OWNERSHIP
                 ************************************************************/
                if (placedItem.user.toString() !== userId) {
                    throw new GraphQLError("User not match", {
                        extensions: {
                            code: "USER_NOT_MATCH"
                        }
                    })
                }

                /************************************************************
                 * UPDATE PLACED ITEM POSITION
                 ************************************************************/
                // Update the placed item position in the database
                placedItem.x = position.x
                placedItem.y = position.y
                await placedItem.save({ session: mongoSession })

                actionMessage = {
                    placedItemId: placedItemId,
                    action: ActionName.Move,
                    success: true,
                    userId
                }
            })

            /************************************************************
             * SEND KAFKA MESSAGES
             ************************************************************/
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
