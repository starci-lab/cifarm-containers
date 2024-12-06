import { Module } from "@nestjs/common"
import { GoldBalanceModule } from "./gold"
import { TokenBalanceModule } from "./token"

@Module({
    imports: [GoldBalanceModule, TokenBalanceModule]
})
export class WalletModule {}
