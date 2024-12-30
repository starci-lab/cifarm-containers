import { Module } from "@nestjs/common"
import { PlacedItemsResolver } from "./placed-items.resolver"
import { PlacedItemsService } from "./placed-items.service"
 

@Module({
    imports: [ ],
    providers: [PlacedItemsService, PlacedItemsResolver]
})
export class PlacedItemsModule {}
