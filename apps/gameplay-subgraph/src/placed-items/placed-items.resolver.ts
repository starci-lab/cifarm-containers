import { Logger } from "@nestjs/common"
import { Resolver, Query, Args } from "@nestjs/graphql"
import { PlacedItemsService } from "./placed-items.service"
import { PlacedItemEntity } from "@src/databases"
import { GetPlacedItemsArgs } from "./"

@Resolver()
export class PlacedItemsResolver {
    private readonly logger = new Logger(PlacedItemsResolver.name)

    constructor(private readonly placeditemsService: PlacedItemsService) {}

    @Query(() => [PlacedItemEntity], {
        name: "placeditems"
    })
    async getPlacedItems(@Args("args") args: GetPlacedItemsArgs): Promise<Array<PlacedItemEntity>> {
        return this.placeditemsService.getPlacedItems(args)
    }

    @Query(() => PlacedItemEntity, {
        name: "placeditem",
        nullable:true
    })
    async getPlacedItemById(@Args("id") id: string): Promise<PlacedItemEntity> {
        this.logger.debug(`getPlacedItemById: id=${id}`)
        return this.placeditemsService.getPlacedItemById(id)
    }
}
