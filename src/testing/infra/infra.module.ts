import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./infra.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { TestContext } from "./infra.types"
import { PostgreSQLModule } from "@src/databases"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { GameplayConnectionService, GameplayMockUserService } from "./gameplay"
import { CacheModule, CacheType } from "@src/cache"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { GameplayModule } from "@src/gameplay"
import { KafkaGroupId, KafkaModule } from "@src/brokers"
import { DateModule } from "@src/date"
import { E2EAxiosModule, E2EConnectionService } from "./e2e"
import { E2ESocketIoModule } from "./e2e/socket-io"

@Module({})
export class TestingInfraModule extends ConfigurableModuleClass {
    public static register(
        options: typeof OPTIONS_TYPE = { context: TestContext.Gameplay }
    ): DynamicModule {
        const context = options.context ?? TestContext.Gameplay
        const dynamicModule = super.register(options)

        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = []
        const exports: Array<NestExport> = []

        switch (context) {
        case TestContext.Gameplay: {
            imports.push(
                EnvModule.forRoot(),
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
                }),
                DateModule.register({
                    isGlobal: true
                })
            )
            const services = [GameplayMockUserService, GameplayConnectionService]
            providers.push(...services)
            exports.push(...services)
            break
        }
        case TestContext.E2E: {
            imports.push(
                EnvModule.forRoot(),
                CacheModule.register({
                    isGlobal: true
                }),
                KafkaModule.register({
                    groupId: KafkaGroupId.Delivery,
                    producerOnlyMode: true,
                    isGlobal: true,
                }),
                PostgreSQLModule.forRoot({
                    context: PostgreSQLContext.Main,
                    database: PostgreSQLDatabase.Gameplay,
                    cacheEnabled: false,
                }),
                JwtModule.register({
                    isGlobal: true
                }),
                BlockchainModule.register({
                    isGlobal: true
                }),
                E2EAxiosModule.register({
                    useGlobalImports: true,
                    isGlobal: true
                }),
                E2ESocketIoModule.register({
                    isGlobal: true
                }),
            )
            const services = [E2EConnectionService]
            providers.push(...services)
            exports.push(...services)
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
