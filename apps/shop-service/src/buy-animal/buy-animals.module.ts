import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuyAnimalsService } from "./buy-animals.service"
import { AnimalEntity, InventoryEntity, ProductEntity, UserEntity } from "@src/database"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { envConfig } from "@src/config"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, ProductEntity, AnimalEntity]),
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
    providers: [BuyAnimalsService],
    exports: [BuyAnimalsService]
})
export class BuyAnimalsModule {}
