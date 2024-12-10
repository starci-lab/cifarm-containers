import { Module } from "@nestjs/common"
import { SeedGrowthInfoThiefedByUsersResolver } from "./seed-growth-info-thiefed-by-users.resolver"
import { SeedGrowthInfoThiefedByUsersService } from "@apps/gameplay-subgraph/src/seed-growth-info-thiefed-by-users/seed-growth-info-thiefed-by-users.service"

@Module({
    providers: [SeedGrowthInfoThiefedByUsersService, SeedGrowthInfoThiefedByUsersResolver]
})
export class SeedGrowthInfoThiefedByUsersModule {}
