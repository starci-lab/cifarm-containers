import { Injectable, Logger } from "@nestjs/common"
import {
    InjectMongoose,
} from "@src/databases"
import { Connection } from "mongoose"
import { InjectKafkaProducer, KafkaTopic } from "@src/brokers"
import { Producer } from "@nestjs/microservices/external/kafka.interface"
import { UserLike } from "@src/jwt"
@Injectable()
export class ReturnService {
    private readonly logger = new Logger(ReturnService.name)

    constructor(
        @InjectMongoose()
        private readonly connection: Connection,
        @InjectKafkaProducer()
        private readonly kafkaProducer: Producer,
    ) {}

    async return({ id: userId }: UserLike): Promise<void> {
        // emit via kafka
        this.kafkaProducer.send({
            topic: KafkaTopic.Return,
            messages: [{ value: JSON.stringify({
                userId
            }) }]
        })
        // No return value needed for void
    }
}
