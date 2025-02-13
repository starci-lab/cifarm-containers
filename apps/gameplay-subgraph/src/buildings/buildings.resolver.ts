import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { Logger } from "@nestjs/common"
import { BuildingsService } from "./buildings.service"
import { BuildingSchema } from "@src/databases"

@Resolver()
export class BuildingsResolver {
    private readonly logger = new Logger(BuildingsResolver.name)

    constructor(private readonly buildingsService: BuildingsService) {}

    @Query(() => [BuildingSchema], { name: "buildings" })
    async buildings(): Promise<Array<BuildingSchema>> {
        return this.buildingsService.getBuildings()
    }

    @Query(() => BuildingSchema, { name: "building" })
    async building(@Args("id", { type: () => ID }) id: string): Promise<BuildingSchema> {
        return this.buildingsService.getBuilding(id)
    }

    @Query(() => BuildingSchema, { name: "buildingByKey" })
    async buildingByKey(@Args("key") key: string): Promise<BuildingSchema> {
        return this.buildingsService.getBuildingByKey(key)
    }
}
