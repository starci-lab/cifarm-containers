import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { EnvModule } from "@src/env"
import { JwtModule } from "@src/jwt"
import { GrpcToHttpInterceptor } from "nestjs-grpc-exceptions"
import { AppV1Module } from "./v1"
import { AppV2Module } from "./v2"
import { GrpcModule, GrpcServiceName } from "@src/grpc"

@Module({
    imports: [
        EnvModule.forRoot(),
        JwtModule.register({
            isGlobal: true
        }),
        GrpcModule.register({
            isGlobal: true,
            name: GrpcServiceName.Gameplay
        }),
        AppV1Module,
        AppV2Module,
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
