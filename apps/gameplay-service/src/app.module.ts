import { Module } from "@nestjs/common"
import { KafkaModule } from "@src/brokers"
import { CacheModule } from "@src/cache"
import { EnvModule } from "@src/env"
import { AuthModule } from "./auth"
import { GameplayModule } from "@src/gameplay"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { APP_FILTER } from "@nestjs/core"
import { BlockchainExceptionFilter, GameplayExceptionFilter } from "./filters"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { DateModule } from "@src/date"
import { MongooseModule } from "@src/databases"
import { ShopModule } from "./shop"
import { PlayerModule } from "./player"
import { DeliveryModule } from "./delivery"
import { FarmingModule } from "./farming"
import { CommunityModule } from "./community"
import { ClaimModule } from "./claim"
import { HoneycombModule } from "./honeycomb"
import { HoneycombModule as CoreHoneycombModule } from "@src/honeycomb"
import { UpgradeModule } from "./upgrade"
import { PlacementModule } from "./placement"
@Module({
    imports: [
        MongooseModule.forRoot(),
        CacheModule.register({
            isGlobal: true
        }),
        EnvModule,
        KafkaModule.register({
            isGlobal: true,
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
        CoreHoneycombModule.register({
            isGlobal: true,
            useGlobalImports: true,
        }),
        AuthModule,
        PlayerModule,
        ShopModule,
        FarmingModule,
        ClaimModule,
        CommunityModule,
        DeliveryModule,
        HoneycombModule,
        UpgradeModule,
        PlacementModule,
        // ProfileModule,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: BlockchainExceptionFilter
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
