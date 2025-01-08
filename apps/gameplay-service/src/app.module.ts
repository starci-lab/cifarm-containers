import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { GameplayPostgreSQLModule } from "@src/databases"
import { EnvModule } from "@src/env"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { AuthModule } from "./auth"
import { ClaimModule } from "./claim"
import { CommunityModule } from "./community"
import { DeliveryModule } from "./delivery"
import { DevModule } from "./dev"
import { FarmingModule } from "./farming"
import { PlacementModule } from "./placement"
import { ProfileModule } from "./profile"
import { ShopModule } from "./shop"
import { UpgradeModule } from "./upgrade"
import { CacheRedisModule } from "@src/cache"

@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        CacheRedisModule.forRoot(),
        EnvModule.forRoot(),
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
 