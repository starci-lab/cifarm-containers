import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { CropEntity, InventoryEntity, ProductEntity, UserEntity } from "@src/database"
import { BuySeedsService } from "./buy-seeds.service"
import { goldWalletGrpcConstants } from "@apps/wallet-service/src/constants"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, CropEntity, ProductEntity]),
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
    providers: [BuySeedsService],
    exports: [BuySeedsService]
})
export class BuySeedsModule {}
