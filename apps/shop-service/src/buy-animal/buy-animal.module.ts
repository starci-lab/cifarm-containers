import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { BuyAnimalService } from "./buy-animal.service"
import { AnimalEntity, InventoryEntity, MarketPricingEntity, UserEntity } from "@src/database"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { envConfig } from "@src/config"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity, MarketPricingEntity, AnimalEntity]),
        ClientsModule.registerAsync(
            [{
                name: walletGrpcConstants.NAME,
                useFactory: async () => ({
                    transport: Transport.GRPC,
                    options: {
                        url: `${envConfig().containers.walletService.host}:${envConfig().containers.walletService.port}`,
                        package: walletGrpcConstants.PACKAGE,
                        protoPath: walletGrpcConstants.PROTO_PATH
                    },
                })}
            ]
        ),
    ],
    providers: [BuyAnimalService],
    exports: [BuyAnimalService],
})
export class BuyAnimalModule {}
