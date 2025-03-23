import { Module } from "@nestjs/common"
import { PlacedItemsConsumer } from "./placed-items.consumer"
import { PlacedItemsGateway } from "./placed-items.gateway"
import { PlacedItemsService } from "./placed-items.service"
import { AuthModule } from "../../auth"

@Module({
    imports: [AuthModule],
    exports: [PlacedItemsGateway],
    providers: [PlacedItemsService, PlacedItemsGateway, PlacedItemsConsumer]
})
export class PlacedItemsModule {}
