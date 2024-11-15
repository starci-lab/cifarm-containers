import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"
import { TokenWalletService } from "./token-wallet.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity])],
    providers: [TokenWalletService],
    exports: [TokenWalletService]
})
export class TokenWalletModule {}
