// buy-supplies.module.ts

import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { InventoryEntity, SupplyEntity, UserEntity } from "@src/database"
import { BuySuppliesService } from "./buy-supplies.service"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, SupplyEntity]),
        ClientsModule.registerAsync([
            {
                name: walletGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.walletService.host}:${envConfig().containers.walletService.port}`,
                        package: walletGrpcConstants.PACKAGE,
                        protoPath: walletGrpcConstants.PROTO_PATH,
                    },
                }),
            },
        ]),
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
})
export class BuySuppliesModule {}
