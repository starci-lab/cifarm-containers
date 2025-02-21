import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
} from "@src/databases"
import { Connection } from "mongoose"
import { ReturnRequest } from "./return.dto"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class ReturnService {
    private readonly logger = new Logger(ReturnService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async return({ userId }: ReturnRequest) {
        const mongoSession = await this.connection.startSession()
        mongoSession.startTransaction()
        try {
            // emit via kafka
            this.clientKafka.emit(KafkaPattern.Return, {
                userId
            })
            return {}
        } catch (error) {
            this.logger.error(error)
            await mongoSession.abortTransaction()
            throw error
        } finally {
            await mongoSession.endSession()
        }
    }
}
