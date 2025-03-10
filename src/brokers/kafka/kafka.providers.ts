import { Provider } from "@nestjs/common"
import { KAFKA } from "./kafka.constants"
import { Kafka } from "kafkajs"
import { MODULE_OPTIONS_TOKEN } from "./kafka.module-definition"
import { KafkaOptions } from "./types"
import { envConfig, Brokers } from "@src/env"
import { v4 } from "uuid"

export const createKafkaFactoryProvider = (): Provider => ({
    provide: KAFKA,
    inject: [MODULE_OPTIONS_TOKEN],
    useFactory: ({ clientId }: KafkaOptions): Kafka => {
        return new Kafka({
            brokers: [`${envConfig().brokers[Brokers.Kafka].host}:${envConfig().brokers[Brokers.Kafka].port}`],
            clientId: clientId ?? v4(),
            sasl: envConfig().brokers[Brokers.Kafka].sasl.enabled && {
                mechanism: "scram-sha-256",
                username: envConfig().brokers[Brokers.Kafka].sasl.username,
                password: envConfig().brokers[Brokers.Kafka].sasl.password,
            },
        })
    }
})
