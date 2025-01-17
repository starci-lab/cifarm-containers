import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./cache.module-definition"
import { KeyvModule } from "./keyv"
import { createMemoryCacheManagerFactoryProvider, createRedisCacheManagerFactoryProvider } from "./cache.providers"
import { CacheType } from "./cache.types"
import { NestExport, NestImport, NestProvider } from "@src/common"

@Module({})
export class CacheModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const cacheType = options.cacheType || CacheType.Redis
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        switch (cacheType) {
        case CacheType.Memory: {
            const provider = createMemoryCacheManagerFactoryProvider()
            providers.push(provider)
            exports.push(provider)
            break
        } 
        case CacheType.Redis: {
            imports.push(KeyvModule.register())
            const provider = createRedisCacheManagerFactoryProvider()
            providers.push(provider)
            exports.push(provider)
        }
        }
        return {
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
