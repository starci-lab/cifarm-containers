import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { AuthController } from "./auth.controller"
import { envConfig, grpcConfig } from "@src/config"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: grpcConfig.gameplay.name,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
                        package: grpcConfig.gameplay.package,
                        protoPath: grpcConfig.gameplay.protoPath
                    }
                })
            }
        ])
    ],
    controllers: [AuthController],
    providers: []
})
export class AuthModule {}
