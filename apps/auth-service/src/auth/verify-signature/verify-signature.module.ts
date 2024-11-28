import { Global, Module } from "@nestjs/common"
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
    SystemEntity,
    TileEntity,
    UpgradeEntity,
    UserEntity
} from "@src/database"
import { VerifySignatureService } from "./verify-signature.service"
import { VerifySignatureController } from "./verify-signature.controller"
import { EnergyModule } from "@src/services"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            InventoryEntity,
            PlacedItemEntity,
            SeedGrowthInfoEntity,
            AnimalInfoEntity,
            BuildingInfoEntity,
            DeliveringProductEntity,
            SystemEntity,
            ProductEntity,
            CropEntity,
            InventoryTypeEntity,
            AnimalEntity,
            BuildingEntity,
            UpgradeEntity,
            PlacedItemTypeEntity,
            TileEntity,
            SupplyEntity
        ]),
        EnergyModule
    ],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
