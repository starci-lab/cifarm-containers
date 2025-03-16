import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { Logger } from "@nestjs/common"
import { BuildingsService } from "./buildings.service"
import { BuildingId, BuildingSchema } from "@src/databases"
@Resolver()
export class BuildingsResolver {
    private readonly logger = new Logger(BuildingsResolver.name)

    constructor(private readonly buildingsService: BuildingsService) {}

    @Query(() => [BuildingSchema], { name: "buildings", description: "Get all buildings" })
    async buildings(): Promise<Array<BuildingSchema>> {
        return this.buildingsService.getBuildings()
    }

    @Query(() => BuildingSchema, { name: "building", description: "Get a building by ID" })
    async building(@Args("id", { type: () => ID, description: "The ID of the building" }) id: BuildingId): Promise<BuildingSchema> {
        return this.buildingsService.getBuilding(id)
    }
}
