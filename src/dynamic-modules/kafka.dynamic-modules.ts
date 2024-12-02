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
                    clientId: v4(),
                    brokers: [...Object.values(envConfig().kafka.brokers)],
                },
                consumer: {
                    groupId: kafkaConfig[key].groupId
                }
            }
        }
    ])
}
