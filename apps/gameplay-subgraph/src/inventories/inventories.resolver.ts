import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { InventoryEntity } from "@src/databases"
import { GetInventoriesArgs, GetInventoriesResponse } from "./inventories.dto"
import { InventoryService } from "./inventories.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class InventoryResolver {
    private readonly logger = new Logger(InventoryResolver.name)

    constructor(private readonly inventoriesService: InventoryService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => GetInventoriesResponse, {
        name: "inventories"
    })
    async getInventories(
        @GraphQLUser() user: UserLike,
        @Args("args") args: GetInventoriesArgs
    ): Promise<GetInventoriesResponse> {
        return this.inventoriesService.getInventories(user, args)
    }

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => InventoryEntity, {
        name: "inventory",
        nullable: true
    })
    async getInventory(@Args("id", { type: () => ID }) id: string): Promise<InventoryEntity> {
        return this.inventoriesService.getInventory(id)
    }
}
