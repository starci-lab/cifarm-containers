import { Global, Module } from "@nestjs/common"
import { ClaimDailyRewardSpinController } from "./claim-daily-reward.controller"
import { ClaimDailyRewardService } from "./claim-daily-reward.service"
import { GameplayModule } from "@src/gameplay"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GameplayModule
    ],
    providers: [ClaimDailyRewardService],
    exports: [ClaimDailyRewardService],
    controllers: [ClaimDailyRewardSpinController]
})
export class ClaimDailyRewardModule {}
