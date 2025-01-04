import { Module } from "@nestjs/common"
import { DailyRewardsResolver } from "./daily-rewards.resolver"
import { DailyRewardsService } from "./daily-rewards.service"
import { GameplayPostgreSQLModule } from "@src/databases"
 

@Module({
    imports: [ GameplayPostgreSQLModule.forRoot() ],
    providers: [ DailyRewardsService, DailyRewardsResolver ]
})
export class DailyRewardsModule {}
