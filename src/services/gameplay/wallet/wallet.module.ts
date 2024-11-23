import { Module } from "@nestjs/common"
import { BalanceModule } from "./balance"
import { GoldBalanceModule } from "./gold"
import { TokenBalanceModule } from "./token"

@Module({
    imports: [GoldBalanceModule, TokenBalanceModule, BalanceModule]
})
export class WalletModule {}
