import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { AuthController } from "./auth.controller"
import { authGrpcConstants } from "@apps/auth-service"
import { envConfig } from "@src/config"
import { AuthInterceptor } from "./auth.interceptor"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: authGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.authService.host}:${envConfig().containers.authService.port}`,
                        package: authGrpcConstants.PACKAGE,
                        protoPath: authGrpcConstants.PROTO_PATH
                    }
                })
            }
        ])
    ],
    controllers: [AuthController],
    providers: [AuthInterceptor]
})
export class AuthModule {}
