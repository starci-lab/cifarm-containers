import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./Testing.module-definition"
import { NestExport, NestProvider } from "@src/common"
import { TestingService } from "./testing.service"

@Module({})
export class TestingModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        providers.push(TestingService)
        exports.push(TestingService)

        return {
            ...dynamicModule,
            providers: [
                ...dynamicModule.providers,
                ...providers
            ],
            exports
        }
    }
}
