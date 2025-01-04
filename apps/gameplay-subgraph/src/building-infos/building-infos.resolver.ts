import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { BuildingInfoEntity } from "@src/databases"
import { GetBuildingInfosArgs } from "./building-infos.dto"
import { BuildingInfosService } from "./building-infos.service"

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

    @Query(() => BuildingInfoEntity, {
        name: "building_info",
        nullable:true
    })
    async getBuildingInfoById(
        @Args("id") id: string
    ): Promise<BuildingInfoEntity> {
        return this.buildingInfosService.getBuildingInfoById(id)
    }
}
