import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/env"
import { v4 } from "uuid"
import { KAFKA_NAME } from "./kafka.constants"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./kafka.module-definition"
import { KafkaGroupId } from "./kafka.types"

@Module({})
export class KafkaModule extends ConfigurableModuleClass {
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const groupId = options.groupId ?? KafkaGroupId.PlacedItemsBroadcast
        const producerOnly = options.producerOnly ?? false

        return {
            module: KafkaModule,
            imports: [
                ClientsModule.register([
                    {
                        name: KAFKA_NAME,
                        transport: Transport.KAFKA,
                        options: {
                            client: {
                                clientId: v4(),
                                brokers: [
                                    `${envConfig().brokers.kafka.host}:${envConfig().brokers.kafka.port}`
                                ],
                                sasl: envConfig().brokers.kafka.sasl.enabled && {
                                    mechanism: "scram-sha-256",
                                    username: envConfig().brokers.kafka.sasl.username,
                                    password: envConfig().brokers.kafka.sasl.password
                                }
                            },
                            producerOnlyMode: producerOnly,
                            consumer: {
                                groupId: groupId
                            }
                        }
                    }
                ])
            ],
        }
    }
}
