import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"
import { GoldWalletService } from "./gold-wallet.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity])],
    providers: [GoldWalletService],
    exports: [GoldWalletService]
})
export class UpdateGoldWalletModule {}
