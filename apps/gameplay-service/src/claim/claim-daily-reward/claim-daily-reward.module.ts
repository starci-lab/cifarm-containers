import { Global, Module } from "@nestjs/common"
import { ClaimDailyRewardSpinController } from "./claim-daily-reward.controller"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { InventoryModule, WalletModule } from "@src/services"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        WalletModule,
        InventoryModule
    ],
    providers: [ClaimDailyRewardService],
    exports: [ClaimDailyRewardService],
    controllers: [ClaimDailyRewardSpinController]
})
export class ClaimDailyRewardModule {}
