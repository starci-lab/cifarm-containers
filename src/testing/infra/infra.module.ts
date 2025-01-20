import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./infra.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { TestContext } from "./infra.types"
import { PostgreSQLMemoryModule, PostgreSQLModule } from "@src/databases"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { ConnectionService, GameplayMockUserService } from "./gameplay"
import { CacheModule, CacheType } from "@src/cache"
import { AxiosModule } from "@src/axios"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { GameplayModule } from "@src/gameplay"
import { KafkaGroupId, KafkaModule } from "@src/brokers"

@Module({})
export class TestingInfraModule extends ConfigurableModuleClass {
    public static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const context = options.context ?? TestContext.Gameplay
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = [EnvModule.forRoot()]
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        switch (context) {
        case TestContext.Gameplay: {
            imports.push(
                PostgreSQLModule.forRoot({
                    context: PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Gameplay,
                    cacheEnabled: false,
                    overrideContext: PostgreSQLContext.Mock
                }),
                CacheModule.register({
                    isGlobal: true,
                    cacheType: CacheType.Memory
                }),
                BlockchainModule.register({
                    isGlobal: true
                }),
                JwtModule.register({
                    isGlobal: true
                }),
                GameplayModule.register({
                    isGlobal: true
                }),
                KafkaModule.register({
                    isGlobal: true,
                    groupId: KafkaGroupId.PlacedItems,
                    producerOnlyMode: true
                })
            )

            const services = [ GameplayMockUserService, ConnectionService ]
            providers.push(...services)
            exports.push(...services)
            break
        }
        case TestContext.E2E: {
            imports.push(
                PostgreSQLMemoryModule.register({
                    context: PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Gameplay
                }),
                CacheModule.register({
                    isGlobal: true
                }),
                AxiosModule.register({})
            )
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
