import { Module } from "@nestjs/common"
//import { HealthcheckModule } from "./healthcheck"
import { AuthModule } from "./auth"
//import { GameplayModule } from "./gameplay"
import { StrategiesModule } from "@src/strategies"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { GrpcToHttpInterceptor } from "nestjs-grpc-exceptions"
import { GameplayModule } from "./gameplay"
import { configForRoot } from "@src/dynamic-modules"

@Module({
    imports: [
        configForRoot(),
        StrategiesModule,
        //HealthcheckModule,
        AuthModule,
        GameplayModule
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: GrpcToHttpInterceptor
        }
    ]
})
export class AppModule {}
