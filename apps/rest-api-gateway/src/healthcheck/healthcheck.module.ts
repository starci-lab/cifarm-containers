import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { healthcheckGrpcConstants } from "@apps/healthcheck-service"
import { HealthcheckController } from "./healthcheck.controller"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: healthcheckGrpcConstants.name,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: "0.0.0.0:3002",
                        package: healthcheckGrpcConstants.package,
                        protoPath: healthcheckGrpcConstants.protoPath
                    }
                })
            }
        ])
    ],
    controllers: [HealthcheckController],
    providers: []
})
export class HealthcheckModule {}
