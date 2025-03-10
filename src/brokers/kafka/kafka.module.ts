import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./kafka.module-definition"
import { createKafkaFactoryProvider } from "./kafka.providers"
import { createKafkaProducerFactoryProvider } from "./producer.providers"
import { NestExport, NestProvider } from "@src/common"
import { KafkaConsumersService } from "./consumers.service"

@Module({})
export class KafkaModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []
        const kafkaProvider = createKafkaFactoryProvider()
        const producerProvider = createKafkaProducerFactoryProvider()
        providers.push(kafkaProvider, producerProvider, KafkaConsumersService)
        exports.push(kafkaProvider, producerProvider, KafkaConsumersService)
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
