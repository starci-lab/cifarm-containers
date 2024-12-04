import { ClientsModule, Transport } from "@nestjs/microservices"
import { KafkaConfigKey, kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"


export interface KafkaClientRegisterParams {
    key: KafkaConfigKey
    producerOnly?: boolean
}
export const kafkaClientRegister = ({ key, producerOnly = false}: KafkaClientRegisterParams) => {
    const checkHeadless = () => {
        const headless1 = envConfig().kafka.headless.headless1
        const headless2 = envConfig().kafka.headless.headless2
        const headless3 = envConfig().kafka.headless.headless3
        return !!(headless1.host && headless1.port && headless2.host && headless2.port && headless3.host && headless3.port)
    }

    return ClientsModule.register([
        {
            name: kafkaConfig[key].name,
            transport: Transport.KAFKA,
            options: {
                client: {
                    clientId: `kafka-${v4()}`,
                    brokers: producerOnly && checkHeadless() ? [
                        `${envConfig().kafka.headless.headless1.host}:${envConfig().kafka.headless.headless1.port}`,
                        `${envConfig().kafka.headless.headless2.host}:${envConfig().kafka.headless.headless2.port}`,
                        `${envConfig().kafka.headless.headless3.host}:${envConfig().kafka.headless.headless3.port}`,
                    ] : [
                        `${envConfig().kafka.default.default1.host}:${envConfig().kafka.default.default1.port}`,
                    ],
                },
                producerOnlyMode: producerOnly,
                consumer: {
                    groupId: kafkaConfig[key].groupId
                }
            }
        }
    ])
}

