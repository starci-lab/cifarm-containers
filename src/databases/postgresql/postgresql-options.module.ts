import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./postgresql-options.module-definition"
import { PostgreSQLOptionsFactory } from "./postgresql-options.factory"
import { CacheOptionsModule } from "../cache-options"

@Module({})
export class PostgreSQLOptionsModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<Provider> = [PostgreSQLOptionsFactory]
        const exports: Array<Provider> = [PostgreSQLOptionsFactory]

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
