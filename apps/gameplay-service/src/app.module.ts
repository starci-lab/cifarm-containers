import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { KafkaModule } from "@src/brokers"
import { CacheModule } from "@src/cache"
import { PostgreSQLModule } from "@src/databases"
import { EnvModule, PostgreSQLContext, PostgreSQLDatabase } from "@src/env"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { UpgradeModule } from "./upgrade"
import { ClaimModule } from "./claim"
import { CommunityModule } from "./community"
import { DevModule } from "./dev"
import { FarmingModule } from "./farming"
import { PlacementModule } from "./placement"
import { ProfileModule } from "./profile"
import { ShopModule } from "./shop"
import { DeliveryModule } from "./delivery"
import { AuthModule } from "./auth"
import { GameplayModule } from "@src/gameplay"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"

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
            isGlobal: true
        }),
        GameplayModule.register({
            isGlobal: true
        }),
        BlockchainModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            isGlobal: true
        }),
        AuthModule,
        ClaimModule,
        CommunityModule,
        DeliveryModule,
        DevModule,
        FarmingModule,
        PlacementModule,
        ProfileModule,
        ShopModule,
        UpgradeModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GrpcServerExceptionFilter
        }
    ]
})
export class AppModule {}
 