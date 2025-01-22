// File: axios.module.ts

import { DynamicModule, Module } from "@nestjs/common"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./axios.module-definition"
import { createE2EAxiosFactoryProvider } from "./axios.providers"
import { AxiosType } from "./axios.types"
import { CacheModule, CacheType } from "@src/cache"

@Module({})
export class E2EAxiosModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = { }): DynamicModule {
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        if (!options.useGlobalImports) {
            imports.push(CacheModule.register({
                cacheType: CacheType.Memory,
            }))
        }

        const axiosNoAuthProvider = createE2EAxiosFactoryProvider(AxiosType.NoAuth)
        const axiosAuthProvider = createE2EAxiosFactoryProvider(AxiosType.Auth)
        const axiosProviders = [axiosNoAuthProvider, axiosAuthProvider]

        providers.push(...axiosProviders)
        exports.push(...axiosProviders)
        
        return {
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
