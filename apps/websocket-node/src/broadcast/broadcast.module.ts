import { Module } from "@nestjs/common"
import { BroadcastGateway } from "./broadcast.gateway"
import { WsJwtAuthModule } from "@src/guards"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalEntity,
    AnimalInfoEntity,
    BuildingEntity,
    BuildingInfoEntity,
    CropEntity,
    DeliveringProductEntity,
    InventoryEntity,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemTypeEntity,
    ProductEntity,
    SeedGrowthInfoEntity,
    SupplyEntity,
    TileEntity,
    UpgradeEntity
} from "@src/database"
import { ClientsModule, Transport } from "@nestjs/microservices"
import { kafkaConfig, envConfig } from "@src/config"
import { v4 } from "uuid"
import { BroadcastController } from "./broadcast.controller"

@Module({
    imports: [
        TypeOrmModule.forFeature([
            // Add entities here
            PlacedItemEntity,
            InventoryEntity,
            DeliveringProductEntity,
            ProductEntity,
            CropEntity,
            BuildingEntity,
            UpgradeEntity,
            PlacedItemTypeEntity,
            InventoryTypeEntity,
            AnimalEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity,
            TileEntity,
            SupplyEntity
        ]),
        WsJwtAuthModule,
        ClientsModule.register([
            {
                name: kafkaConfig().broadcastPlacedItems.name,
                transport: Transport.KAFKA,
                options: {
                    client: {
                        clientId: v4(),
                        brokers: Object.values(envConfig().kafka.brokers)
                    },
                    consumer: {
                        groupId: kafkaConfig().broadcastPlacedItems.groupId
                    }
                }
            }
        ])
    ],
    controllers: [BroadcastController],
    providers: [BroadcastGateway]
})
export class BroadcastModule {}
