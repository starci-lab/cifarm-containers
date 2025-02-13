import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SuppliesService } from "./supplies.service"
import { SupplyId, SupplySchema } from "@src/databases"

@Resolver()
export class SuppliesResolver {
    private readonly logger = new Logger(SuppliesResolver.name)

    constructor(private readonly suppliesService: SuppliesService) {}

    @Query(() => SupplySchema, {
        name: "supply"
    })
    async supply(@Args("id", { type: () => ID }) id: SupplyId): Promise<SupplySchema> {
        return this.suppliesService.getSupply(id)
    }
    
    @Query(() => [SupplySchema], {
        name: "supplies"
    })
    async supplies(): Promise<Array<SupplySchema>> {
        return this.suppliesService.getSupplies()
    }
}
