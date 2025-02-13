import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { InventoryTypesService } from "./inventory-types.service"
import { InventoryTypeSchema } from "@src/databases"

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
    async inventoryType(@Args("id", { type: () => ID }) id: string): Promise<InventoryTypeSchema> {
        return this.inventoryTypesService.getInventoryType(id)
    }

    @Query(() => InventoryTypeSchema, {
        name: "inventoryTypeByKey",
    })
    async inventoryTypeByKey(@Args("key", { type: () => String }) key: string): Promise<InventoryTypeSchema> {
        return this.inventoryTypesService.getInventoryTypeByKey(key)
    }
}