import { Module } from "@nestjs/common"
import { PlacedItemsConsumer } from "./placed-items.consumer"
import { PlacedItemsGateway } from "./placed-items.gateway"
import { PlacedItemsService } from "./placed-items.service"

@Module({
    exports: [PlacedItemsGateway],
    providers: [PlacedItemsService, PlacedItemsGateway, PlacedItemsConsumer]
})
export class PlacedItemsModule {}
