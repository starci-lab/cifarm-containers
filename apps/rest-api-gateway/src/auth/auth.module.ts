import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { grpcClientRegisterAsync } from "@src/dynamic-modules"
import { GrpcServiceName } from "@src/config"

@Module({
    imports: [
        grpcClientRegisterAsync(GrpcServiceName.Gameplay)
    ],
    controllers: [AuthController],
    providers: [AuthController],
    exports: [AuthController]
})
export class AuthModule {}
