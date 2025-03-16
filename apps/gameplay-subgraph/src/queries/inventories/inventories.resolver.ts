import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { InventorySchema } from "@src/databases"
import { GetInventoriesRequest, GetInventoriesResponse } from "./inventories.dto"
import { InventoriesService } from "./inventories.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class InventoriesResolver {
    private readonly logger = new Logger(InventoriesResolver.name)

    constructor(private readonly inventoriesService: InventoriesService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetInventoriesResponse, {
        name: "inventories",
        description: "Get many inventories with pagination"
    })
    async inventories(
        @GraphQLUser() user: UserLike,
        @Args("request") request: GetInventoriesRequest
    ): Promise<GetInventoriesResponse> {
        return await this.inventoriesService.getInventories(user, request)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => InventorySchema, {
        name: "inventory",
        description: "Get an inventory by ID"
    })
    async inventory(@Args("id", { type: () => ID, description: "The ID of the inventory" }) id: string): Promise<InventorySchema> {
        return await this.inventoriesService.getInventory(id)
    }
}
