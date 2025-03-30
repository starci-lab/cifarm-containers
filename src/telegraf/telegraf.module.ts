
import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./telegraf.module-definition"
import { createTelegrafFactoryProvider } from "./telegraf.providers"
import { NestExport, NestProvider } from "@src/common"

@Module({})
export class TelegrafModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []
        const provider = createTelegrafFactoryProvider()
        providers.push(provider)
        exports.push(provider)
        const dynamicModule = super.register(options)
        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
