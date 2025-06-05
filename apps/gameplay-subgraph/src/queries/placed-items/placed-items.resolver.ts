import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemSchema } from "@src/databases"
import { GraphQLUser } from "@src/decorators"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { OccupiedPlacedItemCountsResponse, PlacedItemsRequest, StoredPlacedItemsRequest, StoredPlacedItemsResponse } from "./placed-items.dto"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => PlacedItemSchema, {
        name: "placedItem",
        description: "Get a placed item by ID"
    })
    async placedItem(
        @Args("id", { type: () => ID, description: "The ID of the placed item" }) id: string
    ): Promise<PlacedItemSchema> {
        return this.placeditemsService.placedItem(id)
    }

    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => [PlacedItemSchema], {
        name: "placedItems",
        description: "Get many placed items with pagination"
    })
    async placedItems(
        @GraphQLUser() user: UserLike,
        @Args("request", { type: () => PlacedItemsRequest, nullable: true })
            request: PlacedItemsRequest
    ): Promise<Array<PlacedItemSchema>> {
        return this.placeditemsService.placedItems(user, request)
    }

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => StoredPlacedItemsResponse, {
        name: "storedPlacedItems",
        description: "Get many stored placed items with pagination"
    })
    async storedPlacedItems(
        @GraphQLUser() user: UserLike,
        @Args("request", { type: () => StoredPlacedItemsRequest, nullable: true })
            request: StoredPlacedItemsRequest
    ): Promise<StoredPlacedItemsResponse> {
        return this.placeditemsService.storedPlacedItems(user, request)
    }

    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => OccupiedPlacedItemCountsResponse, {
        name: "occupiedPlacedItemCounts",
        description: "Get the number of occupied placed items"
    })
    async occupiedPlacedItemCounts(@GraphQLUser() user: UserLike): Promise<OccupiedPlacedItemCountsResponse> {  
        return this.placeditemsService.occupiedPlacedItemCounts(user)
    }

}
