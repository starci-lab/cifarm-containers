import { DynamicModule, Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { FacebookAuthStrategy } from "./strategies"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./facebook.module-definition"

@Module({})
export class FacebookModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const strategies = [FacebookAuthStrategy]
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
