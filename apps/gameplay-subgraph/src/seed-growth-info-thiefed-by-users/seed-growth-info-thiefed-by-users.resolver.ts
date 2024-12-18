import { Logger } from "@nestjs/common"
import { Resolver } from "@nestjs/graphql"
import { SeedGrowthInfoThiefedByUsersService } from "./seed-growth-info-thiefed-by-users.service"

@Resolver()
export class SeedGrowthInfoThiefedByUsersResolver {
    private readonly logger = new Logger(SeedGrowthInfoThiefedByUsersResolver.name)

    constructor(
        private readonly seedgrowthinfothiefedbyusersService: SeedGrowthInfoThiefedByUsersService
    ) {}

}
