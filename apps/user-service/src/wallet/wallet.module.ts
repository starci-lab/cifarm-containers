import { Module } from "@nestjs/common"
import { GoldModule } from "./gold"
import { TokenModule } from "./token"
import { BalanceModule } from "./balance"

@Module({
    imports: [GoldModule, TokenModule, BalanceModule]
})
export class WalletModule {}
