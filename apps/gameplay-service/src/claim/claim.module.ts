import { Module } from "@nestjs/common"
import { ClaimDailyRewardModule } from "./claim-daily-reward"
import { SpinModule } from "./spin"

@Module({
    imports: [SpinModule, ClaimDailyRewardModule]
})
export class ClaimModule {}
