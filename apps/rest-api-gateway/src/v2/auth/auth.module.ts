import { Module } from "@nestjs/common"
import { GrpcModule, GrpcServiceName } from "@src/grpc"
import { AuthController } from "./auth.controller"

@Module({
    imports: [
        GrpcModule.forRoot({
            name: GrpcServiceName.Gameplay
        }),
    ],
    controllers: [AuthController],
    providers: [],
    exports: []
})
export class AuthModule {}
