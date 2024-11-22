import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import { shopGrpcConstants } from "@apps/gameplay-service/src/app.constants"
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
                name: shopGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.shopService.host}:${envConfig().containers.shopService.port}`,
                        package: shopGrpcConstants.PACKAGE,
                        protoPath: shopGrpcConstants.PROTO_PATH
                    }
                })
            }
        ])
    ],
    controllers: [GameplayController],
    providers: []
})
export class GameplayModule {}
