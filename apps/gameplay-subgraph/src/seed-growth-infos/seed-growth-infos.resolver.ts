import { Logger, ParseUUIDPipe, UsePipes } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { SeedGrowthInfoEntity } from "@src/databases"
import { GetSeedGrowthInfosArgs } from "./"
import { SeedGrowthInfosService } from "./seed-growth-infos.service"

@Resolver()
export class SeedGrowthInfosResolver {
    private readonly logger = new Logger(SeedGrowthInfosResolver.name)

    constructor(private readonly seedgrowthinfosService: SeedGrowthInfosService) {}

    @Query(() => [SeedGrowthInfoEntity], {
        name: "seed_growth_infos"
    })
    async getSeedGrowthInfos(
        @Args("args") args: GetSeedGrowthInfosArgs
    ): Promise<Array<SeedGrowthInfoEntity>> {
        return this.seedgrowthinfosService.getSeedGrowthInfos(args)
    }
    @Query(() => SeedGrowthInfoEntity, {
        name: "seed_growth_infos",
        nullable:true
    })
    @UsePipes(ParseUUIDPipe)
    async getSeedGrowthInfoByID(
        @Args("id") id: string 
    ): Promise<SeedGrowthInfoEntity> {
        return this.seedgrowthinfosService.getSeedGrowthInfoByID(id)
    }
}
