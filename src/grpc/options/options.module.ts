import { DynamicModule, Module, Provider } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { GrpcOptionsFactory } from "./options.factory"

@Module({ })
export class GrpcOptionsModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const providers: Array<Provider> = [GrpcOptionsFactory]
        const exports: Array<Provider> = [GrpcOptionsFactory]

        if (options.injectionToken) {
            const provider: Provider = {
                provide: options.injectionToken,
                useExisting: GrpcOptionsFactory
            }
            providers.push(provider)
            exports.push(provider)
        }
        const dynamicModules = super.register(options)

        return {
            ...dynamicModules,
            providers: [...dynamicModules.providers, ...providers],
            exports
        }
    }
}
