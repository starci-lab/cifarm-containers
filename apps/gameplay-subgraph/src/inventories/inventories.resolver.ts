import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { InventorySchema } from "@src/databases"
import { GetInventoriesArgs, GetInventoriesResponse } from "./inventories.dto"
import { InventoriesService } from "./inventories.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class InventoriesResolver {
    private readonly logger = new Logger(InventoriesResolver.name)

    constructor(private readonly inventoriesService: InventoriesService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetInventoriesResponse, {
        name: "inventories"
    })
    async inventories(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetInventoriesArgs
    ): Promise<GetInventoriesResponse> {
        return await this.inventoriesService.getInventories(user, args)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => InventorySchema, {
        name: "inventory"
    })
    async inventory(@Args("id", { type: () => ID }) id: string): Promise<InventorySchema> {
        return await this.inventoriesService.getInventory(id)
    }
}
