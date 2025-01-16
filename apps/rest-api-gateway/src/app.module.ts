import { MiddlewareConsumer, Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { EnvModule } from "@src/env"
import { JwtModule } from "@src/jwt"
import { GrpcToHttpInterceptor } from "nestjs-grpc-exceptions"
import { AppV1Module } from "./v1"
import { AppV2Module } from "./v2"
import { GrpcModule, GrpcName } from "@src/grpc"
import { DeviceInfoMiddleware } from "@src/device/device-info"

@Module({
    imports: [
        EnvModule.forRoot(),
        JwtModule.register({
            isGlobal: true
        }),
        GrpcModule.register({
            isGlobal: true,
            name: GrpcName.Gameplay
        }),
        AppV1Module,
        AppV2Module
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: GrpcToHttpInterceptor
        }
    ]
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(DeviceInfoMiddleware).forRoutes("*")
    }
}
