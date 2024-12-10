import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { AppController } from "./app.controller"
import { AuthModule } from "./auth"
import { ClaimModule } from "./claim"
import { CommunityModule } from "./community"
import { DeliveryModule } from "./delivery"
import { DevModule } from "./dev"
import { FarmingModule } from "./farming"
import { PlacementMoveModule } from "./placement/placement-move"
import { ProfileModule } from "./profile"
import { ShopModule } from "./shop"
@Module({
    imports: [
        configForRoot(),
        typeOrmForRoot(),
        cacheRegisterAsync(),
        ClaimModule,
        CommunityModule,
        DeliveryModule,
        DevModule,
        FarmingModule,
        ShopModule,
        ProfileModule,
        AuthModule,
        PlacementMoveModule
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GrpcServerExceptionFilter
        }
    ]
})
export class AppModule {}
 