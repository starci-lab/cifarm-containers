import { DynamicModule, Module } from "@nestjs/common"
import { SetupService } from "./setup.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./setup.module-definition"
@Module({
    providers: [SetupService]
})
export class SetupModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const services = [SetupService]
        return {
            global: options.isGlobal,
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...services],
            exports: [...services]
        }
    }
}
