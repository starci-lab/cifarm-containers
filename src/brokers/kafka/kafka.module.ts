import { Module } from "@nestjs/common"
import { KafkaClientService } from "./kafka.service"
import { KAFKA_NAME } from "./kafka.constants"
import { KafkaOptions } from "./kafka.types"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { v4 } from "uuid"
import { kafkaBrokers } from "./kafka.utils"

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
                                clientId: `kafka-${v4()}`,
                                brokers: kafkaBrokers()
                            },
                            producerOnlyMode: options.producerOnly,
                            consumer: {
                                groupId: options.groupId
                            }
                        }
                    }
                ])
            ],
            providers: [
                KafkaClientService ],
            exports: [ KafkaClientService ]
        }
    }
}

