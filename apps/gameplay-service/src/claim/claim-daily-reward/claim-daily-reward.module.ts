import { Global, Module } from "@nestjs/common"
import { ClaimDailyRewardSpinController } from "./claim-daily-reward.controller"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { InventoryModule, GoldBalanceModule, TokenBalanceModule } from "@src/services"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GoldBalanceModule,
        TokenBalanceModule,
        InventoryModule
    ],
    providers: [ClaimDailyRewardService],
    exports: [ClaimDailyRewardService],
    controllers: [ClaimDailyRewardSpinController]
})
export class ClaimDailyRewardModule {}
