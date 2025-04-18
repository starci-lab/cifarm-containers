import { Logger, UseGuards } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { PlacedItemTypesService } from "./placed-item-types.service"
import { PlacedItemTypeId, PlacedItemTypeSchema } from "@src/databases"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class PlacedItemTypesResolver {
    private readonly logger = new Logger(PlacedItemTypesResolver.name)

    constructor(private readonly placedItemTypesService: PlacedItemTypesService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [PlacedItemTypeSchema], {
        name: "placedItemTypes",
        description: "Get all placed item types"
    })  
    async placedItemTypes(): Promise<Array<PlacedItemTypeSchema>> {
        return this.placedItemTypesService.placedItemTypes()
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => PlacedItemTypeSchema, {
        name: "placedItemType",
        description: "Get a placed item type by ID"
    })
    async placedItemType(
        @Args("id", { type: () => ID, description: "The ID of the placed item type" }) id: PlacedItemTypeId
    ): Promise<PlacedItemTypeSchema> {
        return this.placedItemTypesService.placedItemType(id)
    }
}
