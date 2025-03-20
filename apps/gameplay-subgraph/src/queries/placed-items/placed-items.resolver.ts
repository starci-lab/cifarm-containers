import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemSchema } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { PlacedItemsRequest } from "./placed-items.dto"
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
    @Query(() => [PlacedItemSchema], {
        name: "placedItems",
        description: "Get many placed items with pagination"
    })
    async placedItems(
        @GraphQLUser() user: UserLike,
        @Args("request", { type: () => PlacedItemsRequest, nullable: true })
            request: PlacedItemsRequest
    ): Promise<Array<PlacedItemSchema>> {
        return this.placeditemsService.getPlacedItems(user, request)
    }
}
