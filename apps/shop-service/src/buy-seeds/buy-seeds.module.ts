import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { CropEntity, InventoryEntity, ProductEntity, UserEntity } from "@src/database"
import { BuySeedsService } from "./buy-seeds.service"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { InventoryService } from "../inventory"
import { BuySeedsController } from "./buy-seeds.controller"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, CropEntity, ProductEntity]),
        ClientsModule.registerAsync([
            {
                name: walletGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.walletService.host}:${envConfig().containers.walletService.port}`,
                        package: walletGrpcConstants.PACKAGE,
                        protoPath: walletGrpcConstants.PROTO_PATH
                    }
                })
            }
        ])
    ],
    providers: [BuySeedsService, InventoryService],
    exports: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}
