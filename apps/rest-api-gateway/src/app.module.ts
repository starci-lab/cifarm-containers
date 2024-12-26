import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { configForRoot } from "@src/dynamic-modules"
import { StrategiesModule } from "@src/strategies"
import { GrpcToHttpInterceptor } from "nestjs-grpc-exceptions"
import { AppModuleV1 } from "./v1"
import { AppModuleV2 } from "./v2"
import { HealthcheckModule } from "./healthcheck"

@Module({
    imports: [
        configForRoot(),
        StrategiesModule,
        HealthcheckModule,
        AppModuleV1,
        AppModuleV2
    ],
    controllers: [],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: GrpcToHttpInterceptor
        }
    ],
    exports: []
})

export class AppModule {}
