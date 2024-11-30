import { gameplayGrpcConstants } from "@apps/gameplay-service/src/config"
import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { GameplayController } from "./gameplay.controller"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: healthcheckGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: "0.0.0.0:3002",
                        package: healthcheckGrpcConstants.PACKAGE,
                        protoPath: healthcheckGrpcConstants.PROTO_PATH
                    }
                })
            },
            {
                name: gameplayGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.gameplayService.host}:${envConfig().containers.gameplayService.port}`,
                        package: gameplayGrpcConstants.PACKAGE,
                        protoPath: gameplayGrpcConstants.PROTO_PATH
                    }
                })
            }
        ])
    ],
    controllers: [GameplayController],
    providers: []
})
export class GameplayModule {}
