import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemTypesService } from "./placed-item-types.service"
import { PlacedItemTypeEntity } from "@src/databases"

@Resolver()
export class PlacedItemTypesResolver {
    private readonly logger = new Logger(PlacedItemTypesResolver.name)

    constructor(private readonly placedItemTypesService: PlacedItemTypesService) {}

    @Query(() => [PlacedItemTypeEntity], {
        name: "placedItemTypes"
    })
    async getPlacedItemTypes(): Promise<Array<PlacedItemTypeEntity>> {
        return this.placedItemTypesService.getPlacedItemTypes()
    }

    @Query(() => PlacedItemTypeEntity, {
        name: "placedItemType",
        nullable: true
    })
    async getPlacedItemType(@Args("id", { type: () => ID }) id: string): Promise<PlacedItemTypeEntity> {
        return this.placedItemTypesService.getPlacedItemType(id)
    }
}