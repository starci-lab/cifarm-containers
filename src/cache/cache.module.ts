import { DynamicModule, Module } from "@nestjs/common"
import { RedisType } from "@src/env"
import { ExecModule } from "@src/exec"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache.module-definition"
import { KeyvManagerService } from "./keyv-manager.service"
import { createCacheManagerFactoryProvider } from "./cache.providers"
import { CACHE_MANAGER } from "./cache.constants"

@Module({
    imports: [
        ExecModule.register({
            docker: {
                redisCluster: {
                    type: RedisType.Cache
                }
            }
        })
    ],
    providers: [
        KeyvManagerService,
        createCacheManagerFactoryProvider(),
    ],
    exports: [
        CACHE_MANAGER
    ]
})
export class CacheModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        return super.register(options)
    }
}
