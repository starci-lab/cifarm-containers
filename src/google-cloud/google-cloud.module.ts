import { DynamicModule, Module } from "@nestjs/common"
import { PassportModule } from "@nestjs/passport"
import { GoogleStrategy } from "./strategies"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./google-cloud.module-definition"
import { GoogleOAuthService } from "./oauth.service"
@Module({})
export class GoogleCloudModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        const strategies = [GoogleStrategy]
        const services = [GoogleOAuthService]
        return {
            global: options.isGlobal,
            ...dynamicModule,
            imports: [PassportModule],
            providers: [...dynamicModule.providers, ...strategies, ...services],
            exports: services
        }
    }
}
