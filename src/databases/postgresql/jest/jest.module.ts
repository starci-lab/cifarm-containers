import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./jest.module-definition"
import { createPostgreSQLJestFactory } from "./jest.providers"
import { NestExport, NestProvider } from "@src/common"

@Module({})
export class PostgreSQLJestModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE): DynamicModule {
        const dynamicModule = super.register(options)

        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        const provider = createPostgreSQLJestFactory(options)

        providers.push(provider)
        exports.push(provider)

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
