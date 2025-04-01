import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { InventoryTypesService } from "./inventory-types.service"
import { InventoryTypeId, InventoryTypeSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class InventoryTypesResolver {
    private readonly logger = new Logger(InventoryTypesResolver.name)

    constructor(private readonly inventoryTypesService: InventoryTypesService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [InventoryTypeSchema], {
        name: "inventoryTypes",
        description: "Get all inventory types"
    })
    async inventoryTypes(): Promise<Array<InventoryTypeSchema>> {
        return this.inventoryTypesService.inventoryTypes()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => InventoryTypeSchema, {
        name: "inventoryType",
        description: "Get an inventory type by ID"
    })
    async inventoryType(
        @Args("id", { type: () => ID, description: "The ID of the inventory type" })
            id: InventoryTypeId
    ): Promise<InventoryTypeSchema> {
        return this.inventoryTypesService.inventoryType(id)
    }
}
