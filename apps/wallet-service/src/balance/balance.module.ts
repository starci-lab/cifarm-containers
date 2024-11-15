import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { InventoryEntity, UserEntity } from "@src/database"
import { BalanceService } from "./balance.service"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([UserEntity, InventoryEntity])],
    providers: [BalanceService],
    exports: [BalanceService]
})
export class BalanceModule {}
