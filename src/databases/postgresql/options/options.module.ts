import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { PostgreSQLOptionsFactory } from "./options.factory"
import { CacheOptionsModule } from "../../cache-options"
import { NestExport, NestProvider } from "@src/common"

@Module({})
export class PostgreSQLOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = [PostgreSQLOptionsFactory]
        const exports: Array<NestExport> = [PostgreSQLOptionsFactory]

        if (options.injectionToken) {
            const provider: Provider = {
                provide: options.injectionToken,
                useExisting: PostgreSQLOptionsFactory
            }
            providers.push(provider)
            exports.push(provider)
        }

        return {
            ...dynamicModule,
            imports: [CacheOptionsModule.register()],
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
