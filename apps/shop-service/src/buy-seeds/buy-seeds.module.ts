import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import { InventoryEntity, UserEntity } from "@src/database"
import { BuySeedsService } from "./buy-seeds.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity]),
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
    providers: [BuySeedsService],
    exports: [BuySeedsService],
})
export class BuySeedsModule {}
