import { Module } from "@nestjs/common"
import { PlacedItemTypesResolver } from "./placed-item-types.resolver"
import { PlacedItemTypesService } from "./placed-item-types.service"

@Module({
    providers: [PlacedItemTypesService, PlacedItemTypesResolver]
})
export class PlacedItemTypesModule {}
