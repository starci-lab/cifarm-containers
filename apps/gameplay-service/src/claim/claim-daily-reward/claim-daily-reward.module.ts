import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { ClaimDailyRewardSpinController } from "./claim-daily-reward.controller"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"

@Module({
    imports: [GameplayModule],
    providers: [ClaimDailyRewardService],
    exports: [ClaimDailyRewardService],
    controllers: [ClaimDailyRewardSpinController]
})
export class ClaimDailyRewardModule {}
