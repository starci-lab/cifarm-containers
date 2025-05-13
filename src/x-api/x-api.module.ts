import { DynamicModule, Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { XAuthStrategy } from "./strategies"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./x-api.module-definition"

@Module({})
export class XApiModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const strategies = [XAuthStrategy]
        const services = []
        return {
            global: options.isGlobal,
            ...dynamicModule,
            imports: [PassportModule],
            providers: [...dynamicModule.providers, ...strategies, ...services],
            exports: services
        }
    }
}
