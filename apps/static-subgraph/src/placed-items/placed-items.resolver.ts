import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemEntity } from "@src/database"
import { GetPlacedItemsArgs } from "./placed-items.dto"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    @Query(() => [PlacedItemEntity], {
        name: "placeditems"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getPlacedItems(@Args("args") args: GetPlacedItemsArgs): Promise<Array<PlacedItemEntity>> {
        return this.placeditemsService.getPlacedItems(args)
    }
}
