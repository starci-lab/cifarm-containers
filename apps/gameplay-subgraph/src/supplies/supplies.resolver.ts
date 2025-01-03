import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { SuppliesService } from "./supplies.service"
import { SupplyEntity } from "@src/databases"
import { GetSuppliesArgs } from "./"

@Resolver()
export class SuppliesResolver {
    private readonly logger = new Logger(SuppliesResolver.name)

    constructor(private readonly suppliesService: SuppliesService) {}

    @Query(() => [SupplyEntity], {
        name: "supplies"
    })
    async getSupplies(@Args("args") args: GetSuppliesArgs): Promise<Array<SupplyEntity>> {
        return this.suppliesService.getSupplies(args)
    }

    @Query(() => SupplyEntity, {
        name: "supply",
        nullable:true
    })
    async getSupplyById(@Args("id") id: string): Promise<SupplyEntity | null> {
        this.logger.debug(`getSupplyById: id=${id}`)
        return this.suppliesService.getSupplyById(id)
    }
}
