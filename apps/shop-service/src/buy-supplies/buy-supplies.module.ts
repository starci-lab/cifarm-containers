// buy-supplies.module.ts

import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { InventoryEntity, ProductEntity, SupplyEntity, UserEntity } from "@src/database"
import { BuySuppliesService } from "./buy-supplies.service"
import { goldWalletGrpcConstants } from "@apps/wallet-service/src/constants"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, SupplyEntity, ProductEntity]),
        ClientsModule.registerAsync([
            {
                name: goldWalletGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.goldWalletService.host}:${envConfig().containers.goldWalletService.port}`,
                        package: goldWalletGrpcConstants.PACKAGE,
                        protoPath: goldWalletGrpcConstants.PROTO_PATH
                    }
                })
            }
        ])
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService]
})
export class BuySuppliesModule {}
