import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { SeedGrowthInfoEntity } from "@src/database"
import { GetSeedGrowthInfosArgs } from "./seed-growth-infos.dto"
import { SeedGrowthInfosService } from "./seed-growth-infos.service"

@Resolver()
export class SeedGrowthInfosResolver {
    private readonly logger = new Logger(SeedGrowthInfosResolver.name)

    constructor(private readonly seedgrowthinfosService: SeedGrowthInfosService) {}

    @Query(() => [SeedGrowthInfoEntity], {
        name: "seed_growth_infos"
    })
    async getSeedGrowthInfos(@Args("args") args: GetSeedGrowthInfosArgs): Promise<Array<SeedGrowthInfoEntity>> {
        return this.seedgrowthinfosService.getSeedGrowthInfos(args)
    }
}
