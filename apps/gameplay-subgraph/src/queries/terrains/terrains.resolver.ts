import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { TerrainsService } from "./terrains.service"
import { TerrainId, TerrainSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"


@Resolver()
export class TerrainsResolver {
    private readonly logger = new Logger(TerrainsResolver.name)

    constructor(private readonly terrainService: TerrainsService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [TerrainSchema], { name: "terrains", description: "Get all terrains" })
    async terrains(): Promise<Array<TerrainSchema>> {
        return this.terrainService.terrains()
    }   

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => TerrainSchema, { name: "terrain", description: "Get a terrain by ID" })
    terrain(@Args("id", { type: () => ID, description: "The ID of the terrain" }) id: TerrainId): TerrainSchema {
        return this.terrainService.terrain(id)
    }
}
