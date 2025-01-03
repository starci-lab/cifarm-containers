import { Logger } from "@nestjs/common"
import { Args, Query, Resolver } from "@nestjs/graphql"
import { InventoryEntity } from "@src/databases"
import { GetInventoriesArgs } from "./inventories.dto"
import { InventoryService } from "./inventories.service"
import { UserLike } from "@src/jwt"
import { GraphqlUser } from "@src/decorators"

@Resolver()
export class InventoryResolver {
    private readonly logger = new Logger(InventoryResolver.name)

    constructor(private readonly inventoriesService: InventoryService) {}

    @Query(() => [InventoryEntity], {
        name: "inventories"
    })
    async getInventories(@Args("args") args: GetInventoriesArgs): Promise<Array<InventoryEntity>> {
        this.logger.debug(`getInventories: args=${JSON.stringify(args)}`)
        return this.inventoriesService.getInventories(args)
    }

    @Query(() => InventoryEntity, {
        name: "inventory",
        nullable:true
    })
    async getInventoryById(@Args("id") id: string): Promise<InventoryEntity> {
        this.logger.debug(`getInventoryById: id=${id}`)
        return this.inventoriesService.getInventoryById(id)
    }

    @Query(() => InventoryEntity, {
        name: "inventoriesByUserId",
        nullable:true
    })
    async getInventoryByUserId(@GraphqlUser() user: UserLike, @Args("args") args: GetInventoriesArgs): Promise<Array<InventoryEntity>> {
        this.logger.debug(`getInventoryByUserId: userId=${user.id} args=${JSON.stringify(args)}`)

        return this.inventoriesService.getInventoriesByUserId({
            ...args,
            userId: user?.id
        })
    }
}
