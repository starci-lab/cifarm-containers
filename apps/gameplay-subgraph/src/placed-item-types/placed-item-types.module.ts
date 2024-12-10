import { Module } from "@nestjs/common"
import { PlacedItemTypesResolver } from "./placed-item-types.resolver"
import { PlacedItemTypesService } from "./placed-item-types.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [PlacedItemTypesService, PlacedItemTypesResolver]
})
export class PlacedItemTypesModule {}
