import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { AuthController } from "./auth.controller"
import { authGrpcConstants } from "@apps/auth-service"
import { envConfig } from "@src/config"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: authGrpcConstants.name,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.authService.host}:${envConfig().containers.authService.port}`,
                        package: authGrpcConstants.package,
                        protoPath: authGrpcConstants.protoPath
                    }
                })
            }
        ])
    ],
    controllers: [AuthController],
    providers: []
})
export class AuthModule {}
