import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemTypesService } from "./placed-item-types.service"
import { PlacedItemTypeSchema } from "@src/databases"

@Resolver()
export class PlacedItemTypesResolver {
    private readonly logger = new Logger(PlacedItemTypesResolver.name)

    constructor(private readonly placedItemTypesService: PlacedItemTypesService) {}

    @Query(() => [PlacedItemTypeSchema], {
        name: "placedItemTypes"
    })
    async placedItemTypes(): Promise<Array<PlacedItemTypeSchema>> {
        return this.placedItemTypesService.getPlacedItemTypes()
    }

    @Query(() => PlacedItemTypeSchema, {
        name: "placedItemType",
        nullable: true
    })
    async placedItemType(@Args("id", { type: () => ID }) id: string): Promise<PlacedItemTypeSchema> {
        return this.placedItemTypesService.getPlacedItemType(id)
    }

    @Query(() => PlacedItemTypeSchema, {
        name: "placedItemTypeByKey",
    })
    async placedItemTypeByKey(@Args("key", { type: () => String }) key: string): Promise<PlacedItemTypeSchema> {
        return this.placedItemTypesService.getPlacedItemTypeByKey(key)
    }
}