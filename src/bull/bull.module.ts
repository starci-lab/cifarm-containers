import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { bullData } from "./bull.constants"
import { BullQueueName, BullRegisterOptions } from "./bull.types"
import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./bull.module-definition"
import { OPTIONS_TYPE } from "@src/brokers"
import { QueueOptionsModule } from "./queue-options.module"
import { QueueOptionsFactory } from "./queue.options-factory"

@Module({})
export class BullModule extends ConfigurableModuleClass {
    // register the queue
    public static registerQueue(options: BullRegisterOptions = {}) {
        const queueName = options.queueName ?? BullQueueName.Crop
        const registerQueueDynamicModule = NestBullModule.registerQueue({
            name: bullData[queueName].name,
            prefix: bullData[queueName].prefix
        })
        return {
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
                    imports: [QueueOptionsModule.forRoot()],
                    inject: [QueueOptionsFactory],
                    useFactory: async (queueOptionsFactory: QueueOptionsFactory) =>
                        queueOptionsFactory.createQueueOptions()
                })
            ]
        }
    }
}
