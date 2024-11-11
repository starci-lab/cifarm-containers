import { broadcastGrpcConstants } from "@apps/broadcast-service"
import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { PlacedItemsGateway } from "./placed_items.gateway"
import { envConfig } from "@src/config"

@Module({
    imports: [
        ClientsModule.registerAsync([
            {
                name: broadcastGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.broadcastService.host}:${envConfig().containers.broadcastService.port}`,
                        package: broadcastGrpcConstants.PACKAGE,
                        protoPath: broadcastGrpcConstants.PROTO_PATH,
                    },
                }),
            },
        ]),
    ],
    controllers: [],
    providers: [PlacedItemsGateway],
})
export class PlacedItemsModule {}
