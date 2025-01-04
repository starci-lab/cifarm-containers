import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { InventoryEntity } from "@src/databases"
import { GetInventoriesArgs } from "./inventories.dto"
import { InventoryService } from "./inventories.service"
import { GraphQLJwtAuthGuard, UserLike } from "@src/jwt"
import { GraphQLUser } from "@src/decorators"

@Resolver()
export class InventoryResolver {
    private readonly logger = new Logger(InventoryResolver.name)

    constructor(private readonly inventoriesService: InventoryService) {}

    @UseGuards(GraphQLJwtAuthGuard)
    @Query(() => [InventoryEntity], {
        name: "inventories"
    })
    async getInventories(@GraphQLUser() user: UserLike, @Args("args") args: GetInventoriesArgs): Promise<Array<InventoryEntity>> {
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
