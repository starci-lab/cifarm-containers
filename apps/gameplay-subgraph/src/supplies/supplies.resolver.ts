import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SuppliesService } from "./supplies.service"
import { SupplyEntity } from "@src/databases"

@Resolver()
export class SuppliesResolver {
    private readonly logger = new Logger(SuppliesResolver.name)

    constructor(private readonly suppliesService: SuppliesService) {}

    @Query(() => SupplyEntity, {
        name: "supply",
        nullable: true
    })
    async getSupply(@Args("id", { type: () => ID }) id: string): Promise<SupplyEntity | null> {
        return this.suppliesService.getSupply(id)
    }
    
    @Query(() => [SupplyEntity], {
        name: "supplies"
    })
    async getSupplies(): Promise<Array<SupplyEntity>> {
        return this.suppliesService.getSupplies()
    }
}
