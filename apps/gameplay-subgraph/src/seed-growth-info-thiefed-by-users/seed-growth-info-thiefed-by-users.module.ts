import { Module } from "@nestjs/common"
import { SeedGrowthInfoThiefedByUsersResolver } from "./seed-growth-info-thiefed-by-users.resolver"
import { SeedGrowthInfoThiefedByUsersService } from "./seed-growth-info-thiefed-by-users.service"

@Module({
    providers: [SeedGrowthInfoThiefedByUsersService, SeedGrowthInfoThiefedByUsersResolver]
})
export class SeedGrowthInfoThiefedByUsersModule {}
