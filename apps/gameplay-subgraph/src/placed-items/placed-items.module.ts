import { Module } from "@nestjs/common"
import { PlacedItemsResolver } from "./placed-items.resolver"
import { PlacedItemsService } from "./placed-items.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Module({
    imports: [typeOrmForFeature()],
    providers: [PlacedItemsService, PlacedItemsResolver]
})
export class PlacedItemsModule {}
