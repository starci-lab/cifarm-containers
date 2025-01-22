import { Module } from "@nestjs/common"
import { RedisType } from "@src/env"
import { QueueOptionsFactory } from "./options.factory"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { IoRedisModule } from "@src/native"

@Module({
    imports: [
        IoRedisModule.register({
            type: RedisType.Job,
            additionalOptions: {
                maxRetriesPerRequest: null
            }
        })
    ],
    providers: [QueueOptionsFactory],
    exports: [QueueOptionsFactory]
})
export class QueueOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
