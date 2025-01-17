import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemEntity } from "@src/databases"
import { GetPlacedItemsArgs, GetPlacedItemsResponse } from "./placed-items.dto"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => PlacedItemEntity, {
        name: "placedItem",
        nullable: true
    })
    async getPlacedItem(@Args("id", { type: () => ID }) id: string): Promise<PlacedItemEntity> {
        return this.placeditemsService.getPlacedItem(id)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetPlacedItemsResponse, {
        name: "placedItems"
    })
    async getPlacedItems(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetPlacedItemsArgs
    ): Promise<GetPlacedItemsResponse> {
        return this.placeditemsService.getPlacedItems(user, args)
    }
}
