import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
    UserSchema
} from "@src/databases"
import { Connection } from "mongoose"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { VisitRequest, VisitResponse } from "./visit.dto"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class VisitService {
    private readonly logger = new Logger(VisitService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async visit({ neighborUserId, userId }: VisitRequest): Promise<VisitResponse> {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            if (!neighborUserId) {
                const randomUser = await this.connection
                    .model<UserSchema>(UserSchema.name) // Replace UserSchema with your user schema
                    .aggregate([
                        {
                            $match: {
                                _id: { $ne: userId },  // Exclude the current user
                            }
                        },
                        { 
                            $sample: { size: 1 } // Get one random user
                        }
                    ]).session(mongoSession)
        
                // If no random user is found, throw an error or handle it as needed
                if (!randomUser.length) {
                    throw new GrpcNotFoundException("No random user found")
                }
                neighborUserId = randomUser[0]._id
            }
            // emit via kafka
            this.clientKafka.emit(KafkaPattern.Visit, {
                userId,
                neighborUserId
            })
            return {
                neighborUserId
            }
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
