import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { InventoryTypesService } from "./inventory-types.service"
import { InventoryTypeId, InventoryTypeSchema } from "@src/databases"

@Resolver()
export class InventoryTypesResolver {
    private readonly logger = new Logger(InventoryTypesResolver.name)

    constructor(private readonly inventoryTypesService: InventoryTypesService) {}

    @Query(() => [InventoryTypeSchema], {
        name: "inventoryTypes"
    })
    async inventoryTypes(): Promise<Array<InventoryTypeSchema>> {
        return this.inventoryTypesService.getInventoryTypes()
    }

    @Query(() => InventoryTypeSchema, {
        name: "inventoryType",
        nullable: true
    })
    async inventoryType(@Args("id", { type: () => ID }) id: InventoryTypeId): Promise<InventoryTypeSchema> {
        return this.inventoryTypesService.getInventoryType(id)
    }
}