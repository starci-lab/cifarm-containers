import { Injectable, Logger } from "@nestjs/common"
import { InjectMongoose, UserSchema } from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { VisitRequest, VisitResponse } from "./visit.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "kafkajs"

@Injectable()
export class VisitService {
    private readonly logger = new Logger(VisitService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer
    ) {}

    async visit({ neighborUserId, userId }: VisitRequest): Promise<VisitResponse> {
        const mongoSession = await this.connection.startSession()

        try {
            const result = await mongoSession.withTransaction(async (mongoSession) => {
                // If no neighborUserId is provided, select a random user
                if (!neighborUserId) {
                    const randomUser = await this.connection
                        .model<UserSchema>(UserSchema.name)
                        .aggregate([
                            {
                                $match: { _id: { $ne: userId } } // Exclude the current user
                            },
                            {
                                $sample: { size: 1 } // Get one random user
                            }
                        ])
                        .session(mongoSession)

                    // If no random user is found, throw an error
                    if (!randomUser.length) {
                        throw new GrpcNotFoundException("No random user found")
                    }
                    neighborUserId = randomUser[0]._id
                }

                // Send visit event via Kafka
                await this.kafkaProducer.send({
                    topic: KafkaTopic.Visit,
                    messages: [
                        {
                            value: JSON.stringify({
                                userId,
                                neighborUserId
                            })
                        }
                    ]
                })
                // Commit the transaction
                return { neighborUserId }
            })

            // Return the result from the transaction
            return result
        } catch (error) {
            this.logger.error(error)
            // Abort the transaction in case of an error
            throw error
        } finally {
            // End the session after the transaction is complete
            await mongoSession.endSession()
        }
    }
}
