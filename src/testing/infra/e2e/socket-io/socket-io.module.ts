import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./socket-io.module-definition"
import { NestExport, NestProvider } from "@src/common"
import { createSocketIoFactoryProvider } from "./socket-io.providers"
import { IoService } from "./socket-io.types"

@Module({})
export class E2ESocketIoModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = { }): DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        for (const service of Object.values(IoService)) {
            const provider = createSocketIoFactoryProvider(service)
            providers.push(provider)
            exports.push(provider)
        }

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}