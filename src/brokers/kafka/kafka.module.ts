import { DynamicModule, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { KAFKA } from "./kafka.constants"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./kafka.module-definition"
import { KafkaGroupId } from "./kafka.types"
import { KafkaOptionsFactory, KafkaOptionsModule } from "./options"

@Module({})
export class KafkaModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const groupId = options.groupId ?? KafkaGroupId.Gameplay
        const producerOnlyMode = options.producerOnlyMode ?? false
        const dynamicModule = super.register(options)
        const kafkaDynamicModule = ClientsModule.registerAsync([
            {
                name: KAFKA,
                imports: [KafkaOptionsModule.register()],
                inject: [KafkaOptionsFactory],
                useFactory: (kafkaOptionsFactory: KafkaOptionsFactory) => ({
                    transport: Transport.KAFKA,
                    options: {
                        client: kafkaOptionsFactory.createKafkaConfig(),
                        producerOnlyMode,
                        consumer: {
                            groupId,
                            allowAutoTopicCreation: true,
                        }
                    }
                })
            }
        ])
        return {
            ...dynamicModule,
            imports: [kafkaDynamicModule],
            exports: [kafkaDynamicModule]
        }
    }
}
