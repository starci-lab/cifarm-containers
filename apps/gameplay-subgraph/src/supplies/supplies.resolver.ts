import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SuppliesService } from "./supplies.service"
import { SupplySchema } from "@src/databases"

@Resolver()
export class SuppliesResolver {
    private readonly logger = new Logger(SuppliesResolver.name)

    constructor(private readonly suppliesService: SuppliesService) {}

    @Query(() => SupplySchema, {
        name: "supply"
    })
    async supply(@Args("id", { type: () => ID }) id: string): Promise<SupplySchema> {
        return this.suppliesService.getSupply(id)
    }
    
    @Query(() => [SupplySchema], {
        name: "supplies"
    })
    async supplies(): Promise<Array<SupplySchema>> {
        return this.suppliesService.getSupplies()
    }

    @Query(() => SupplySchema, {
        name: "supplyByKey",
    })
    async supplyByKey(@Args("key", { type: () => String }) key: string): Promise<SupplySchema> {
        return this.suppliesService.getSupplyByKey(key)
    }
}
