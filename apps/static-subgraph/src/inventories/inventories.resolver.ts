import { GetInventoriesArgs } from "@apps/static-subgraph/src/inventories/inventories.dto"
import { InventoryService } from "@apps/static-subgraph/src/inventories/inventories.service"
import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { InventoryEntity } from "@src/database"

@Resolver()
export class InventoryResolver {
    private readonly logger = new Logger(InventoryResolver.name)

    constructor(private readonly inventoriesService: InventoryService) { }
    @Query(() => [InventoryEntity], {
        name: "inventories"
    })
    async getInventories(@Args("args") args: GetInventoriesArgs): Promise<Array<InventoryEntity>> {
        this.logger.debug(`getInventories: args=${JSON.stringify(args)}`)
        return this.inventoriesService.getInventories(args)
    }
}
