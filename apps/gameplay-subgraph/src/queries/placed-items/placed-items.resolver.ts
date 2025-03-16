import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemSchema } from "@src/databases"
import { GetPlacedItemsRequest, GetPlacedItemsResponse } from "./placed-items.dto"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => PlacedItemSchema, {
        name: "placedItem",
        description: "Get a placed item by ID"
    })
    async placedItem(
        @Args("id", { type: () => ID, description: "The ID of the placed item" }) id: string
    ): Promise<PlacedItemSchema> {
        return this.placeditemsService.getPlacedItem(id)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetPlacedItemsResponse, {
        name: "placedItems",
        description: "Get many placed items with pagination"
    })
    async placedItems(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetPlacedItemsRequest
    ): Promise<GetPlacedItemsResponse> {
        return this.placeditemsService.getPlacedItems(user, request)
    }
}
