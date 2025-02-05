import { Module } from "@nestjs/common"
import { KafkaGroupId, KafkaModule } from "@src/brokers"
import { CacheModule } from "@src/cache"
import { CacheQueryModule, PostgreSQLModule } from "@src/databases"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { UpgradeModule } from "./upgrade"
import { ClaimModule } from "./claim"
import { CommunityModule } from "./community"
import { FarmingModule } from "./farming"
import { PlacementModule } from "./placement"
import { ProfileModule } from "./profile"
import { ShopModule } from "./shop"
import { DeliveryModule } from "./delivery"
import { AuthModule } from "./auth"
import { GameplayModule } from "@src/gameplay"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { APP_FILTER } from "@nestjs/core"
import { BlockchainExceptionFilter, GameplayExceptionFilter } from "./filters"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { DateModule } from "@src/date"

@Module({
    imports: [
        PostgreSQLModule.forRoot({
            context: PostgreSQLContext.Main,
            database: PostgreSQLDatabase.Gameplay,
        }),
        CacheModule.register({
            isGlobal: true
        }),
        EnvModule,
        KafkaModule.register({
            isGlobal: true,
            producerOnlyMode: true,
            groupId: KafkaGroupId.PlacedItems
        }),
        GameplayModule.register({
            isGlobal: true
        }),
        BlockchainModule.register({
            isGlobal: true
        }),
        DateModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            useGlobalImports: true,
            isGlobal: true
        }),
        CacheQueryModule.register({
            isGlobal: true
        }),
        AuthModule,
        ClaimModule,
        CommunityModule,
        DeliveryModule,
        FarmingModule,
        PlacementModule,
        ProfileModule,
        ShopModule,
        UpgradeModule
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: BlockchainExceptionFilter,
        },
        {
            provide: APP_FILTER,
            useClass: GrpcServerExceptionFilter
        },
        {
            provide: APP_FILTER,
            useClass: GameplayExceptionFilter
        }
    ]
})
export class AppModule {}
 