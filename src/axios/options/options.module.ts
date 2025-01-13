import { DynamicModule, Module, Provider } from "@nestjs/common"
import { NestExport, NestProvider } from "@src/common"
import { AxiosOptionsFactory } from "./options.factory"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"

@Module({})
export class AxiosOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = [AxiosOptionsFactory]
        const exports: Array<NestExport> = [AxiosOptionsFactory]

        if (options.injectionToken) {
            const provider: Provider = {
                provide: options.injectionToken,
                useExisting: AxiosOptionsFactory
            }
            providers.push(provider)
            exports.push(provider)
        }

        return {
            ...dynamicModule,
            imports: [],
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
