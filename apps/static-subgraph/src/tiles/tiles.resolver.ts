import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { TilesService } from "./tiles.service"
import { TileEntity } from "@src/database"
import { GetTilesArgs } from "./tiles.dto"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class TilesResolver {
    private readonly logger = new Logger(TilesResolver.name)

    constructor(private readonly tilesService: TilesService) {}

    @Query(() => [TileEntity], {
        name: "tiles"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getTiles(@Args("args") args: GetTilesArgs): Promise<Array<TileEntity>> {
        return this.tilesService.getTiles(args)
    }
}
