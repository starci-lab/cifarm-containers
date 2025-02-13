import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { TilesService } from "./tiles.service"
import { TileId, TileSchema } from "@src/databases"

@Resolver()
export class TilesResolver {
    private readonly logger = new Logger(TilesResolver.name)

    constructor(private readonly tilesService: TilesService) {}

    @Query(() => [TileSchema], {
        name: "tiles"
    })
    async tiles(): Promise<Array<TileSchema>> {
        return this.tilesService.getTiles()
    }

    @Query(() => TileSchema, {
        name: "tile",
        nullable: true
    })
    async tile(@Args("id", { type: () => ID }) id: TileId): Promise<TileSchema | null> {
        return this.tilesService.getTile(id)
    }
}
