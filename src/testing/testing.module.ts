import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./testing.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { TestContext } from "./testing.types"
import { PostgreSQLModule } from "@src/databases"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { GameplayMockUserService } from "./gameplay"
import { CacheModule } from "@src/cache"
//import { KafkaModule } from "@src/brokers"
import { AxiosModule } from "@src/axios"

@Module({})
export class TestingModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const context = options.context ?? TestContext.Gameplay
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = [EnvModule.forRoot(),]
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        switch (context) {
        case TestContext.Gameplay: {
            imports.push(
                PostgreSQLModule.forRoot({
                    context: PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Gameplay
                }),
                CacheModule.register({
                    isGlobal: true
                })
            )
            providers.push(GameplayMockUserService)
            exports.push(GameplayMockUserService)
            break
        }
        case TestContext.E2E: {
            imports.push(
                PostgreSQLModule.forRoot({
                    context: PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Gameplay
                }),
                CacheModule.register({
                    isGlobal: true
                }),
                AxiosModule.register({})
                // KafkaModule.register({
                //     groupId: options.groupId,
                //     producerOnlyMode: options.producerOnlyMode,
                //     isGlobal: true
                // })
            )
            providers.push(GameplayMockUserService)
            exports.push(GameplayMockUserService)
            break
        }
        }

        return {
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
