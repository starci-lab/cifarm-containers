import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { TilesService } from "./tiles.service"
import { TileId, TileSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class TilesResolver {
    private readonly logger = new Logger(TilesResolver.name)

    constructor(private readonly tilesService: TilesService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [TileSchema], {
        name: "tiles",
        description: "Get all tiles"
    })
    async tiles(): Promise<Array<TileSchema>> {
        return this.tilesService.tiles()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => TileSchema, {
        name: "tile",
        description: "Get a tile by ID"
    })
    async tile(
        @Args("id", { type: () => ID, description: "The ID of the tile" }) id: TileId
    ): Promise<TileSchema | null> {
        return this.tilesService.tile(id)
    }
}
