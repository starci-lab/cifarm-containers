import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./options.module-definition"
import { GrpcOptionsFactory } from "./options.factory"
import { NestExport, NestProvider } from "@src/common"

@Module({ })
export class GrpcOptionsModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const providers: Array<NestProvider> = [GrpcOptionsFactory]
        const exports: Array<NestExport> = [GrpcOptionsFactory]
        const dynamicModules = super.register(options)

        return {
            ...dynamicModules,
            providers: [...dynamicModules.providers, ...providers],
            exports
        }
    }
}
