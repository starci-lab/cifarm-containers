import { Module } from "@nestjs/common"
import { AuthController } from "./auth.controller"
import { GrpcModule, GrpcServiceName } from "@src/grpc"

@Module({
    imports: [
        GrpcModule.forRoot({
            name: GrpcServiceName.Gameplay
        }),
    ],
    controllers: [AuthController],
    providers: [AuthController],
    exports: [AuthController]
})
export class AuthModule {}
