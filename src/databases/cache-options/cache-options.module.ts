import { Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache-options.module-definition"
import { CacheOptionsService } from "./cache-options.service"
import { RedisType } from "@src/env"
import { IoRedisModule } from "@src/native"

@Module({
    imports: [
        IoRedisModule.register({
            type: RedisType.Cache,
            optionsOnly: true
        }),
    ],
    providers: [CacheOptionsService],
    exports: [CacheOptionsService]
})
export class CacheOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) {
        return super.register(options)
    }
}
