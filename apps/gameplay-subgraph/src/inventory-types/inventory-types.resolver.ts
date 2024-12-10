import { GetInventoryTypesArgs, InventoryTypeService } from "./"
import { Logger, UseInterceptors } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { InventoryTypeEntity } from "@src/database"
import { GraphQLCacheInterceptor } from "@src/interceptors/graphql.cache.interceptor"

@Resolver()
export class InventoryTypeResolver {
    private readonly logger = new Logger(InventoryTypeResolver.name)

    constructor(private readonly inventoryTypesService: InventoryTypeService) {}

    @Query(() => [InventoryTypeEntity], {
        name: "inventory_types"
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getInventoryTypes(
        @Args("args") args: GetInventoryTypesArgs
    ): Promise<Array<InventoryTypeEntity>> {
        this.logger.debug(`getInventoryTypes: args=${JSON.stringify(args)}`)
        return this.inventoryTypesService.getInventoryTypes(args)
    }

    @Query(() => InventoryTypeEntity, {
        name: "inventory_type",
        nullable:true
    })
    @UseInterceptors(GraphQLCacheInterceptor)
    async getInventoryTypeById(@Args("id") id: string): Promise<InventoryTypeEntity> {
        this.logger.debug(`getInventoryTypeById: id=${id}`)
        return this.inventoryTypesService.getInventoryTypeById(id)
    }
}
