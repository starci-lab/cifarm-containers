import { DynamicModule, Module } from "@nestjs/common"
import { InitializationService } from "./initialization.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./initialization.module-definition"
@Module({
    providers: [InitializationService]
})
export class InitializationModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const services = [InitializationService]
        return {
            global: options.isGlobal,
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...services],
            exports: [...services]
        }
    }
}
