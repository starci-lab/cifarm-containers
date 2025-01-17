import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { InventoryTypesService } from "./inventory-types.service"
import { InventoryTypeEntity } from "@src/databases"

@Resolver()
export class InventoryTypesResolver {
    private readonly logger = new Logger(InventoryTypesResolver.name)

    constructor(private readonly inventoryTypesService: InventoryTypesService) {}

    @Query(() => [InventoryTypeEntity], {
        name: "inventoryTypes"
    })
    async getInventoryTypes(): Promise<Array<InventoryTypeEntity>> {
        return this.inventoryTypesService.getInventoryTypes()
    }

    @Query(() => InventoryTypeEntity, {
        name: "inventoryType",
        nullable: true
    })
    async getInventoryType(@Args("id", { type: () => ID }) id: string): Promise<InventoryTypeEntity> {
        return this.inventoryTypesService.getInventoryType(id)
    }
}