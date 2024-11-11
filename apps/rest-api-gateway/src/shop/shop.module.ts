import { shopGrpcConstants } from "@apps/shop-service/src/constants"
import { Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { envConfig } from "@src/config"
import { ShopController } from "./shop.controller"

@Module({
    imports: [
        ClientsModule.registerAsync(
            [{
                name: shopGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.shopService.host}:${envConfig().containers.shopService.port}`,
                        package: shopGrpcConstants.PACKAGE,
                        protoPath: shopGrpcConstants.PROTO_PATH
                    },
                })}
            ]
        ),
    ],
    controllers: [ShopController],
    providers: [],
})
export class ShopModule {}