import { Global, Module } from "@nestjs/common"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig } from "@src/config"
import {
    CropEntity,
    InventoryEntity,
    PlacedItemEntity,
    ProductEntity,
    UserEntity
} from "@src/database"
import { ConstructBuildingService } from "./construct-building.service"
import { walletGrpcConstants } from "@apps/wallet-service/src/constants"
import { InventoryService } from "../inventory"
import { ConstructBuildingController } from "./construct-building.controller"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            CropEntity,
            ProductEntity,
            PlacedItemEntity
        ]),
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
    providers: [ConstructBuildingService, InventoryService],
    exports: [ConstructBuildingService],
    controllers: [ConstructBuildingController]
})
export class ConstructBuildingModule {}
