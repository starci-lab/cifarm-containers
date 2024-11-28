import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import {
    AnimalInfoEntity,
    BuildingInfoEntity,
    DeliveringProductEntity,
    InventoryEntity,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    UserEntity
} from "@src/database"
import { VerifySignatureService } from "./verify-signature.service"
import { VerifySignatureController } from "./verify-signature.controller"

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
        ])
    ],
    controllers: [VerifySignatureController],
    providers: [VerifySignatureService],
    exports: [VerifySignatureService]
})
export class VerifySignatureModule {}
