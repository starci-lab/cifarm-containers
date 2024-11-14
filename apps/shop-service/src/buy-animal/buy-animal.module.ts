import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuyAnimalService } from "./buy-animal.service"
import { AnimalEntity, InventoryEntity, ProductEntity, UserEntity } from "@src/database"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { goldWalletGrpcConstants } from "@apps/gold-wallet-service/src/constants"
import { envConfig } from "@src/config"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, ProductEntity, AnimalEntity]),
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
    providers: [BuyAnimalService],
    exports: [BuyAnimalService]
})
export class BuyAnimalModule {}
