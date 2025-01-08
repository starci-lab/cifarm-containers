import { BullModule as NestBullModule } from "@nestjs/bullmq"
import { bullData } from "./bull.constants"
import { BullQueueName, RegisterQueuesOptions } from "./bull.types"
import { Module } from "@nestjs/common"
import { ConfigurableModuleClass } from "./bull.module-definition"
import { OPTIONS_TYPE } from "@src/brokers"
import { QueueOptionsModule } from "./queue-options.module"
import { QueueOptionsFactory } from "./queue-options.factory"

@Module({})
export class BullModule extends ConfigurableModuleClass {
    // register the queue
    public static registerQueues(options: RegisterQueuesOptions = {}) {
        let queueNames = options.queueNames
        if (!queueNames) {
            queueNames = []
        } else if (!Array.isArray(options.queueNames)) queueNames = [options.queueNames]
        else {
            queueNames = options.queueNames
        }
        const registerQueueDynamicModules = queueNames.map((queueName: BullQueueName) => {
            return NestBullModule.registerQueue({
                name: bullData[queueName].name,
                prefix: bullData[queueName].prefix
            })
        })
        return {
            global: options.isGlobal,
            module: BullModule,
            imports: registerQueueDynamicModules,
            exports: registerQueueDynamicModules
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
