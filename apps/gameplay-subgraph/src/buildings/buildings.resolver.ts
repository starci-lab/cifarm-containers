import { Resolver, Query, Args } from "@nestjs/graphql"
import { Logger } from "@nestjs/common"
import { BuildingEntity } from "@src/databases"
import { BuildingsService } from "./buildings.service"
import { GetBuildingsArgs } from "./buildings.dto"

@Resolver()
export class BuildingsResolver {
    private readonly logger = new Logger(BuildingsResolver.name)

    constructor(private readonly buildingsService: BuildingsService) {}

    @Query(() => [BuildingEntity], { name: "buildings" })
    async getBuildings(
        @Args("args") args: GetBuildingsArgs
    ): Promise<Array<BuildingEntity>> {
        return this.buildingsService.getBuildings(args)
    }

    @Query(() => BuildingEntity, { name: "building" })
    async getBuildingById(
        @Args("id") id: string
    ): Promise<BuildingEntity> {
        return this.buildingsService.getBuildingById(id)
    }
}
