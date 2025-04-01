import { Logger, UseGuards } from "@nestjs/common"
import { Args, ID, Query, Resolver } from "@nestjs/graphql"
import { SupplyId, SupplySchema } from "@src/databases"
import { SuppliesService } from "./supplies.service"
import { GraphQLThrottlerGuard } from "@src/throttler"

@Resolver()
export class SuppliesResolver {
    private readonly logger = new Logger(SuppliesResolver.name)

    constructor(private readonly suppliesService: SuppliesService) {}

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => SupplySchema, {
        name: "supply",
        description: "Get a supply by ID"
    })
    async supply(@Args("id", { type: () => ID, description: "The ID of the supply" }) id: SupplyId): Promise<SupplySchema> {
        return this.suppliesService.supply(id)
    }

    
    @UseGuards(GraphQLThrottlerGuard)
    @Query(() => [SupplySchema], {
        name: "supplies",
        description: "Get all supplies"
    })
    async supplies(): Promise<Array<SupplySchema>> {
        return this.suppliesService.supplies()
    }
}
