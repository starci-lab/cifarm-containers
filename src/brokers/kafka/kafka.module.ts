import { Module } from "@nestjs/common"
import { KafkaClientService } from "./kafka.service"
import { KAFKA_NAME } from "./kafka.constants"
import { KafkaOptions } from "./kafka.types"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/env"
import { v4 } from "uuid"

@Module({})
export class KafkaModule {
    public static forRoot(options: KafkaOptions) {
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
                                    `${envConfig().messageBrokers.kafka.host}:${envConfig().messageBrokers.kafka.port}`
                                ],
                                sasl: {
                                    mechanism: "scram-sha-256",
                                    username: envConfig().messageBrokers.kafka.username,
                                    password: envConfig().messageBrokers.kafka.password
                                }
                            },
                            producerOnlyMode: options.producerOnly,
                            consumer: {
                                groupId: options.groupId
                            }
                        }
                    }
                ])
            ],
            providers: [KafkaClientService],
            exports: [KafkaClientService]
        }
    }
}
