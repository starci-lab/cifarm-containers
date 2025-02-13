import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemSchema } from "@src/databases"
import { GetPlacedItemsArgs, GetPlacedItemsResponse } from "./placed-items.dto"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => PlacedItemSchema, {
        name: "placedItem",
        nullable: true
    })
    async placedItem(@Args("id", { type: () => ID }) id: string): Promise<PlacedItemSchema> {
        return this.placeditemsService.getPlacedItem(id)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetPlacedItemsResponse, {
        name: "placedItems"
    })
    async placedItems(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetPlacedItemsArgs
    ): Promise<GetPlacedItemsResponse> {
        return this.placeditemsService.getPlacedItems(user, args)
    }
}
