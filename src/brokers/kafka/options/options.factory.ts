
import { Injectable } from "@nestjs/common"
import { KafkaConfig } from "@nestjs/microservices/external/kafka.interface"
import { Brokers, envConfig } from "@src/env"
import { v4 } from "uuid"

@Injectable()
export class KafkaOptionsFactory {
    constructor( ) { }

    createKafkaConfig() : KafkaConfig {
        return {
            clientId: v4(),
            brokers: [
                `${envConfig().brokers[Brokers.Kafka].host}:${envConfig().brokers[Brokers.Kafka].port}`
            ],
            sasl: envConfig().brokers[Brokers.Kafka].sasl.enabled && {
                mechanism: "scram-sha-256",
                username: envConfig().brokers[Brokers.Kafka].sasl.username,
                password: envConfig().brokers[Brokers.Kafka].sasl.password
            }
        }
    }
}