import { Module, Global } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UpdateWalletService } from "./update-wallet.service"
import { InventoryEntity, UserEntity } from "@src/database"

@Global()
@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, InventoryEntity])
    ],
    providers: [UpdateWalletService],
    exports: [UpdateWalletService],
})
export class UpdateWalletModule {}
