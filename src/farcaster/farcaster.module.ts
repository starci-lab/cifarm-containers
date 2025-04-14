import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./farcaster.module-definition"
import { NestExport, NestProvider } from "@src/common"
import { FarcasterService } from "./farcaster.service"
@Module({})
export class FarcasterModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)
        
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        const services = [
            FarcasterService
        ]

        providers.push(...services)
        exports.push(...services)

        return {
            ...dynamicModule,
            providers,
            exports
        }
    }
}
