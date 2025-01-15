import { Module } from "@nestjs/common"
import { PlacedItemsController } from "./placed-items.controller"
import { PlacedItemsGateway } from "./placed-items.gateway"
import { PlacedItemsService } from "./placed-items.service"
import { MainModule } from "../main"

@Module({
    imports: [MainModule],
    controllers: [PlacedItemsController],
    providers: [PlacedItemsService, PlacedItemsGateway]
})
export class PlacedItemsModule {}
