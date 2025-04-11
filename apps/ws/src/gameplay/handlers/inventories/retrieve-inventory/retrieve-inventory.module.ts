import { Module } from "@nestjs/common"
import { RetrieveInventoryService } from "./retrieve-inventory.service"
import { RetrieveInventoryGateway } from "./retrieve-inventory.gateway"

@Module({
    providers: [RetrieveInventoryService, RetrieveInventoryGateway]
})
export class RetrieveInventoryModule {} 