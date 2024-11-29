import { GetBuildingInfosArgs } from "@apps/static-subgraph/src/building-infos/building-infos.dto"
import { BuildingInfosService } from "@apps/static-subgraph/src/building-infos/building-infos.service"
import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { BuildingInfoEntity } from "@src/database"

@Resolver()
export class BuildingInfosResolver {
    private readonly logger = new Logger(BuildingInfosResolver.name)

    constructor(private readonly buildingInfosService: BuildingInfosService) {}

    @Query(() => [BuildingInfoEntity], {
        name: "building_infos"
    })
    async getBuildingInfos(
        @Args("args") args: GetBuildingInfosArgs
    ): Promise<Array<BuildingInfoEntity>> {
        return this.buildingInfosService.getBuildingInfos(args)
    }
}
