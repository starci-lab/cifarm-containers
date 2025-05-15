import { Module } from "@nestjs/common"
import { DeleteInventoryService } from "./delete-inventory.service"
import { DeleteInventoryGateway } from "./delete-inventory.gateway"

@Module({
    providers: [DeleteInventoryService, DeleteInventoryGateway]
})
export class DeleteInventoryModule {}
