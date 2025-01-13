// File: axios.module.ts

import { DynamicModule, Module } from "@nestjs/common"
import { NestExport, NestProvider } from "@src/common"
import { AxiosType } from "./axios.constants"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./axios.module-definition"
import { createAxiosFactoryProvider } from "./axios.providers"

@Module({})
export class AxiosModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        options.type = options.type || AxiosType.NoAuth

        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        const axiosFactoryProvider = createAxiosFactoryProvider(options.type)

        providers.push(axiosFactoryProvider)
        exports.push(axiosFactoryProvider)
        
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
