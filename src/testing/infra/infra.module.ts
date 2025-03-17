import { DynamicModule, Module } from "@nestjs/common"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./infra.module-definition"
import { NestExport, NestImport, NestProvider } from "@src/common"
import { TestContext } from "./infra.types"
import { EnvModule } from "@src/env"
import { GameplayConnectionService, GameplayMockUserService } from "./gameplay"
import { CacheModule, CacheType } from "@src/cache"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { GameplayModule } from "@src/gameplay"
import { KafkaModule } from "@src/brokers"
import { DateModule } from "@src/date"
import { E2EConnectionService, E2ESocketIoModule } from "./e2e"
import { MongooseModule } from "@src/databases"

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
                MongooseModule.forRoot(),
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
                }),
                DateModule.register({
                    isGlobal: true
                })
            )
            const services = [GameplayMockUserService, GameplayConnectionService]
            providers.push(...services)
            exports.push(...services, ...imports)
            break
        }
        case TestContext.E2E: {
            imports.push(
                EnvModule.forRoot(),
                CacheModule.register({
                    isGlobal: true
                }),
                KafkaModule.register({
                    isGlobal: true,
                }),
                MongooseModule.forRoot(),
                JwtModule.register({
                    isGlobal: true
                }),
                BlockchainModule.register({
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
