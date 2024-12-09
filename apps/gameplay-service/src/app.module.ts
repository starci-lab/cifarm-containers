import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { AppController } from "./app.controller"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { CommunityModule } from "./community"
import { ClaimModule } from "./claim"
import { ShopModule } from "./shop"
import { DevModule } from "./dev"
import { DeliveryModule } from "./delivery"
import { FarmingModule } from "./farming"
import { ProfileModule } from "./profile"
import { AuthModule } from "./auth"
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
        AuthModule
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
 