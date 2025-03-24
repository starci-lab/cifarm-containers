import { Module } from "@nestjs/common"
import { RetainInventoryService } from "./retain-inventory.service"
import { RetainInventoryGateway } from "./retain-inventory.gateway"

@Module({
    providers: [RetainInventoryService, RetainInventoryGateway]
})
export class RetainInventoryModule {} 