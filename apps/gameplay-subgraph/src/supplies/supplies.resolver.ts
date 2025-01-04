import { Logger } from "@nestjs/common"
import { Resolver, Query, Args, ID } from "@nestjs/graphql"
import { SuppliesService } from "./supplies.service"
import { SupplyEntity } from "@src/databases"
import { GetSuppliesArgs } from "./supplies.dto"

@Resolver()
export class SuppliesResolver {
    private readonly logger = new Logger(SuppliesResolver.name)

    constructor(private readonly suppliesService: SuppliesService) {}

    @Query(() => SupplyEntity, {
        name: "supply",
        nullable:true
    })
    async getSupply(@Args("id", { type: () => ID }) id: string): Promise<SupplyEntity | null> {
        this.logger.debug(`getSupplyById: id=${id}`)
        return this.suppliesService.getSupply({ id})
    }
    
    @Query(() => [SupplyEntity], {
        name: "supplies"
    })
    async getSupplies(@Args("args") args: GetSuppliesArgs): Promise<Array<SupplyEntity>> {
        return this.suppliesService.getSupplies(args)
    }
}
