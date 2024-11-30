import { Module } from "@nestjs/common"
import { SpinModule } from "./spin"
import { ClaimDailyRewardModule } from "./claim-daily-reward"

@Module({
    imports: [SpinModule, ClaimDailyRewardModule]
})
export class ClaimModule {}
