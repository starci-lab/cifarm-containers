import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./memory.module-definition"
import { PostgreSQLDatabase } from "@src/env"
import { createPostgreSQLMemoryFactory } from "./memory.providers"
import { NestProvider } from "@src/common"

@Module({})
export class PostgreSQLMemoryCoreModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)
        options.database = options.database || PostgreSQLDatabase.Gameplay

        const providers: Array<NestProvider> = []
        const exports: Array<NestProvider> = []
        const provider = createPostgreSQLMemoryFactory(options)
        providers.push(provider)
        exports.push(provider)

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
