import { Module } from "@nestjs/common"
import { ClaimHoneycombDailyRewardService } from "./claim-honeycomb-daily-reward.service"
import { ClaimHoneycombDailyRewardController } from "./claim-honeycomb-daily-reward.controller"


@Module({
    imports: [],
    providers: [ClaimHoneycombDailyRewardService],
    controllers: [ClaimHoneycombDailyRewardController]
})
export class ClaimHoneycombDailyRewardModule {}
