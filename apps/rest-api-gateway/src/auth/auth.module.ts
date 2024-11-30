import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { AuthController } from "./auth.controller"
import { envConfig } from "@src/config"
import { gameplayGrpcConstants } from "@apps/gameplay-service"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: gameplayGrpcConstants.name,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
                        package: gameplayGrpcConstants.package,
                        protoPath: gameplayGrpcConstants.protoPath
                    }
                })
            }
        ])
    ],
    controllers: [AuthController],
    providers: []
})
export class AuthModule {}
