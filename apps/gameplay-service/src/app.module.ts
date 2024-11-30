import { Module } from "@nestjs/common"
import { APP_FILTER } from "@nestjs/core"
import { GrpcServerExceptionFilter } from "nestjs-grpc-exceptions"
import { AppController } from "./app.controller"
import { cacheRegisterAsync, configForRoot, typeOrmForRoot } from "@src/dynamic-modules"
import { AuthModule } from "@src/services"
import { CommunityModule } from "./community"
import { ClaimModule } from "./claim"
import { ShopModule } from "./shop"
import { DevModule } from "./dev"
import { DeliveryModule } from "./delivery"
import { FarmingModule } from "./farming"
@Module({
    imports: [
        configForRoot(),
        typeOrmForRoot(),
        cacheRegisterAsync(),
        AuthModule,
        ClaimModule,
        CommunityModule,
        DeliveryModule,
        DevModule,
        FarmingModule,
        ShopModule,
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
