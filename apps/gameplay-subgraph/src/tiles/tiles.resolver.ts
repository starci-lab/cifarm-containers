import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { TilesService } from "./tiles.service"
import { TileSchema } from "@src/databases"

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
    async tile(@Args("id", { type: () => ID }) id: string): Promise<TileSchema | null> {
        return this.tilesService.getTile(id)
    }

    @Query(() => TileSchema, {
        name: "tileByKey"
    })
    async tileByKey(@Args("key", { type: () => String }) key: string): Promise<TileSchema> {
        return this.tilesService.getTileByKey(key)
    }
}
