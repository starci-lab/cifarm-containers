import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemEntity } from "@src/databases"
import { GetPlacedItemsArgs } from "./"
import { GraphQLUser } from "@src/decorators"
import { UserLike } from "@src/jwt"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    @Query(() => PlacedItemEntity, {
        name: "placeditem",
        nullable: true
    })
    async getPlacedItemById(@Args("id") id: string): Promise<PlacedItemEntity> {
        this.logger.debug(`getPlacedItemById: id=${id}`)
        return this.placeditemsService.getPlacedItem(id)
    }

    @Query(() => [PlacedItemEntity], {
        name: "placeditems"
    })
    async getPlacedItems(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetPlacedItemsArgs
    ): Promise<Array<PlacedItemEntity>> {
        return this.placeditemsService.getPlacedItems(user, args)
    }
}
