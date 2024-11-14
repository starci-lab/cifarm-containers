import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { BuildingsService } from "./buildings.service"
import { BuildingEntity } from "@src/database"
import { GetBuildingsArgs } from "./buildings.dto"

@Resolver()
export class BuildingsResolver {
    private readonly logger = new Logger(BuildingsResolver.name)

    constructor(private readonly buildingsService: BuildingsService) {}

    @Query(() => [BuildingEntity], {
        name: "buildings"
    })
    async getBuildings(@Args("args") args: GetBuildingsArgs): Promise<Array<BuildingEntity>> {
        return this.buildingsService.getBuildings(args)
    }
}
