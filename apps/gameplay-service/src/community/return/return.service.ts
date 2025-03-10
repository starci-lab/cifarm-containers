import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
} from "@src/databases"
import { Connection } from "mongoose"
import { ReturnRequest } from "./return.dto"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "@nestjs/microservices/external/kafka.interface"

@Injectable()
export class ReturnService {
    private readonly logger = new Logger(ReturnService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
    ) {}

    async return({ userId }: ReturnRequest) {
        // emit via kafka
        this.kafkaProducer.send({
            topic: KafkaTopic.Return,
            messages: [{ value: JSON.stringify({
                userId
            }) }]
        })
        return {}
    }
}
