import { Module } from "@nestjs/common"
import { APP_INTERCEPTOR } from "@nestjs/core"
import { EnvModule } from "@src/env"
import { JwtModule } from "@src/jwt"
import { GrpcToHttpInterceptor } from "nestjs-grpc-exceptions"
import { AppV1Module } from "./v1"
import { AppV2Module } from "./v2"
import { GrpcModule, GrpcName } from "@src/grpc"
import { DateModule } from "@src/date"

@Module({
    imports: [
        EnvModule.forRoot(),
        DateModule.register({
            isGlobal: true
        }),
        JwtModule.register({
            useGlobalImports: true,
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
}
