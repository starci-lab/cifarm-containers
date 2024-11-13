import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"
import { UpdateGoldWalletService } from "./update-gold-wallet.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity])
    ],
    providers: [UpdateGoldWalletService],
    exports: [UpdateGoldWalletService],
})
export class UpdateGoldWalletModule {}
