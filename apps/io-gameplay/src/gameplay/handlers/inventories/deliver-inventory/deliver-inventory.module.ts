import { Module } from "@nestjs/common"
import { DeliverInventoryService } from "./deliver-inventory.service"
import { DeliverInventoryGateway } from "./deliver-inventory.gateway"

@Module({
    providers: [DeliverInventoryService, DeliverInventoryGateway]
})
export class DeliverInventoryModule {} 