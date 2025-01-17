import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { TilesService } from "./tiles.service"
import { TileEntity } from "@src/databases"

@Resolver()
export class TilesResolver {
    private readonly logger = new Logger(TilesResolver.name)

    constructor(private readonly tilesService: TilesService) {}

    @Query(() => [TileEntity], {
        name: "tiles"
    })
    async getTiles(): Promise<Array<TileEntity>> {
        return this.tilesService.getTiles()
    }

    @Query(() => TileEntity, {
        name: "tile",
        nullable: true
    })
    async getTile(@Args("id", { type: () => ID }) id: string): Promise<TileEntity | null> {
        return this.tilesService.getTile(id)
    }
}
