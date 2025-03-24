import { Module } from "@nestjs/common"
import { ClaimDailyRewardModule } from "./claim-daily-reward"

@Module({
    imports: [ClaimDailyRewardModule]
})

export class ClaimModule {}
