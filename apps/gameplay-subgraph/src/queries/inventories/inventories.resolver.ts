import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { InventorySchema } from "@src/databases"
import { InventoriesService } from "./inventories.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class InventoriesResolver {
    private readonly logger = new Logger(InventoriesResolver.name)

    constructor(private readonly inventoriesService: InventoriesService) {}

    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => [InventorySchema], {
        name: "inventories",
        description: "Get many inventories with pagination"
    })
    async inventories(
        @GraphQLUser() user: UserLike
    ): Promise<Array<InventorySchema>> {
        return await this.inventoriesService.getInventories(user)
    }

    
    @UseGuards(GraphQLThrottlerGuard, GraphQLJwtAuthGuard)
    @Query(() => InventorySchema, {
        name: "inventory",
        description: "Get an inventory by ID"
    })
    async inventory(@Args("id", { type: () => ID, description: "The ID of the inventory" }) id: string): Promise<InventorySchema> {
        return await this.inventoriesService.getInventory(id)
    }
}
