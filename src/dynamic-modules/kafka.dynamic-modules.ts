import { ClientsModule, Transport } from "@nestjs/microservices"
import { KafkaConfigKey, kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"

export interface KafkaClientRegisterParams {
    key: KafkaConfigKey
}
export const kafkaClientRegister = ({ key }: KafkaClientRegisterParams) => {
    return ClientsModule.register([
        {
            name: kafkaConfig[key].name,
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: `kafka-${v4()}`,
                    brokers: [
                        `${envConfig().kafka.brokers.broker1.host}:${envConfig().kafka.brokers.broker1.port}`,
                        `${envConfig().kafka.brokers.broker2.host}:${envConfig().kafka.brokers.broker2.port}`,
                        `${envConfig().kafka.brokers.broker3.host}:${envConfig().kafka.brokers.broker3.port}`,
                    ],
                },
                consumer: {
                    groupId: kafkaConfig[key].groupId
                }
            }
        }
    ])
}
