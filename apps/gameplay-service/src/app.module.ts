import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
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
import { EnvModule } from "@src/config"

@Module({
    imports: [
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
 