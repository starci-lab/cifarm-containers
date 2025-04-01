import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { Logger, UseGuards } from "@nestjs/common"
import { BuildingsService } from "./buildings.service"
import { BuildingId, BuildingSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"
@Resolver()
export class BuildingsResolver {
    private readonly logger = new Logger(BuildingsResolver.name)

    constructor(private readonly buildingsService: BuildingsService) {}

         
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [BuildingSchema], { name: "buildings", description: "Get all buildings" })
    buildings(): Array<BuildingSchema> {
        return this.buildingsService.buildings()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => BuildingSchema, { name: "building", description: "Get a building by ID" })
    building(@Args("id", { type: () => ID, description: "The ID of the building" }) id: BuildingId): BuildingSchema {
        return this.buildingsService.building(id)
    }
}
