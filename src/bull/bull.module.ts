import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { bullData } from "./bull.constants"
import { BullQueueName, RegisterQueueOptions } from "./bull.types"
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./bull.module-definition"
import { OPTIONS_TYPE } from "@src/brokers"
import { QueueOptionsModule, QueueOptionsFactory } from "./options"

@Module({})
export class BullModule extends ConfigurableModuleClass {
    // register the queue
    public static registerQueue(options: RegisterQueueOptions = {}): DynamicModule {
        const queueName = options.queueName || BullQueueName.Plant
        // register the queue
        const registerQueueDynamicModule = NestBullModule.registerQueue({
            name: bullData[queueName].name,
            prefix: bullData[queueName].prefix
        })
        return {
            global: options.isGlobal,
            module: BullModule,
            imports: [registerQueueDynamicModule],
            exports: [registerQueueDynamicModule]
        }
    }

    // for root
    public static forRoot(options: typeof OPTIONS_TYPE = {}) {
        const dynamicModule = super.forRoot(options)
        return {
            ...dynamicModule,
            imports: [
                NestBullModule.forRootAsync({
                    imports: [QueueOptionsModule.register()],
                    inject: [QueueOptionsFactory],
                    useFactory: async (queueOptionsFactory: QueueOptionsFactory) =>
                        queueOptionsFactory.createQueueOptions()
                })
            ]
        }
    }
}
