import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./firebase-admin.module-definition"
import { NestExport, NestProvider } from "@src/common"
import { FirebaseAdminService } from "./firebase-admin.service"

@Module({})
export class FirebaseAdminModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)
        
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        const services = [
            FirebaseAdminService
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
