import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"
import { UpdateWalletService } from "./update-wallet.service"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity])
    ],
    providers: [UpdateWalletService],
    exports: [UpdateWalletService],
})
export class UpdateWalletModule {}
