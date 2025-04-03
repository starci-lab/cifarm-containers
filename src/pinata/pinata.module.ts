import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./pinata.module-definition"
import { NestProvider } from "@src/common"
import { PinataService } from "./pinata.service"

@Module({})
export class PinataModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {   
        const dynamicModule = super.register(options)
        const isGlobal = options.isGlobal
        const providers: Array<NestProvider> = []
        const exports: Array<NestProvider> = []
        providers.push(PinataService)
        exports.push(PinataService)
        return {
            ...dynamicModule,
            global: isGlobal,
            providers,
            exports
        }
    }
}