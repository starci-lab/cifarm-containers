import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { SuppliesService } from "./supplies.service"
import { SupplyEntity } from "@src/database"
import { GetSuppliesArgs } from "./supplies.dto"

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
}
