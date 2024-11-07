
import { broadcastGrpcConstants } from "@apps/broadcast-service"
import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { PlacedItemsGateway } from "./placed_items.gateway"

@Module({
    imports: [
        ClientsModule.registerAsync(
            [{
                name: broadcastGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: "0.0.0.0:3004",
                        package: broadcastGrpcConstants.PACKAGE,
                        protoPath: broadcastGrpcConstants.PROTO_PATH
                    },
                })}
            ]
        ),
    ],
    controllers: [],
    providers: [
        PlacedItemsGateway
    ],
})
export class PlacedItemsModule {}