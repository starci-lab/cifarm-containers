import { Module } from "@nestjs/common"
import { RedisIoAdapter } from "./redis.adapter"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./io.module-definition"

@Module({
    imports: [],
    providers: [RedisIoAdapter],
    exports: [RedisIoAdapter]
})
export class IoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
