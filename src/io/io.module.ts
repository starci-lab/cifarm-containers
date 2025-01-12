import { Module } from "@nestjs/common"
import { RedisIoAdapter } from "./redis-io.adapter"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./io.module-definition"
import { RedisType } from "@src/env"
import { RedisModule } from "@src/native"

@Module({
    imports: [
        RedisModule.register({
            type: RedisType.Adapter
        }),
    ],
    providers: [RedisIoAdapter],
    exports: [RedisIoAdapter]
})

export class IoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
