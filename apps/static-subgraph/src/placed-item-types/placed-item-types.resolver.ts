import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { PlacedItemTypesService } from "./placed-item-types.service"
import { PlacedItemTypeEntity } from "@src/database"
import { GetPlacedItemTypesArgs } from "./placed-item-types.dto"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class PlacedItemTypesResolver {
    private readonly logger = new Logger(PlacedItemTypesResolver.name)

    constructor(private readonly placeditemtypesService: PlacedItemTypesService) {}

    @Query(() => [PlacedItemTypeEntity], {
        name: "placed_item_types"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getPlacedItemTypes(
        @Args("args") args: GetPlacedItemTypesArgs
    ): Promise<Array<PlacedItemTypeEntity>> {
        return this.placeditemtypesService.getPlacedItemTypes(args)
    }
}
