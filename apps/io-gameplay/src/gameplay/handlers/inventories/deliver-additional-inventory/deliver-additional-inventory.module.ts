import { Module } from "@nestjs/common"
import { DeliverAdditionalInventoryService } from "./deliver-additional-inventory.service"
import { DeliverAdditionalInventoryGateway } from "./deliver-additional-inventory.gateway"

@Module({
    providers: [DeliverAdditionalInventoryService, DeliverAdditionalInventoryGateway]
})
export class DeliverAdditionalInventoryModule {} 