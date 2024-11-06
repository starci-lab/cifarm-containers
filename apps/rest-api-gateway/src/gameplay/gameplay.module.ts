import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import { HealthcheckController } from "./gameplay.controller"

@Module({
    imports: [
        ClientsModule.registerAsync(
            [{
                name: healthcheckGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: "0.0.0.0:3002",
                        package: healthcheckGrpcConstants.PACKAGE,
                        protoPath: healthcheckGrpcConstants.PROTO_PATH
                    },
                })}
            ]
        ),
    ],
    controllers: [HealthcheckController],
    providers: [],
})
export class GameplayModule {}