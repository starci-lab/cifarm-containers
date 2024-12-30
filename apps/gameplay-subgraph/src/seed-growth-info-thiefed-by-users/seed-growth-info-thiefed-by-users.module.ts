import { Module } from "@nestjs/common"
import { SeedGrowthInfoThiefedByUsersResolver } from "./seed-growth-info-thiefed-by-users.resolver"
import { SeedGrowthInfoThiefedByUsersService } from "./seed-growth-info-thiefed-by-users.service"
 

@Module({
    imports: [ ],
    providers: [SeedGrowthInfoThiefedByUsersService, SeedGrowthInfoThiefedByUsersResolver]
})
export class SeedGrowthInfoThiefedByUsersModule {}
