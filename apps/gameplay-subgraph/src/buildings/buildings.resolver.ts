import { Resolver, Query, Args } from "@nestjs/graphql"
import { Logger, UseInterceptors } from "@nestjs/common"
import { BuildingEntity } from "@src/database"
import { BuildingsService } from "./buildings.service"
import { GetBuildingsArgs } from "./"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class BuildingsResolver {
    private readonly logger = new Logger(BuildingsResolver.name)

    constructor(private readonly buildingsService: BuildingsService) {}

    @Query(() => [BuildingEntity], { name: "buildings" })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getBuildings(
        @Args("args") args: GetBuildingsArgs
    ): Promise<Array<BuildingEntity>> {
        return this.buildingsService.getBuildings(args)
    }
    
    @UseInterceptors(GraphQLCacheInterceptor)
    @Query(() => BuildingEntity, { name: "building" })
    async getBuildingById(
        @Args("id") id: string
    ): Promise<BuildingEntity> {
        return this.buildingsService.getBuildingById(id)
    }
}
