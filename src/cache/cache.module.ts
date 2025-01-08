import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache.module-definition"
import { KeyvModule } from "./keyv"
import { createCacheManagerFactoryProvider } from "./cache.providers"
import { CACHE_MANAGER } from "./cache.constants"

@Module({
    imports: [
        KeyvModule.register(),
    ],
    providers: [
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
