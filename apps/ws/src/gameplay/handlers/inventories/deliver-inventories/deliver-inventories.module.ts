import { Module } from "@nestjs/common"
import { DeliverInventoriesService } from "./deliver-inventories.service"
import { DeliverInventoriesGateway } from "./deliver-inventories.gateway"

@Module({
    providers: [DeliverInventoriesService, DeliverInventoriesGateway]
})
export class DeliverInventoriesModule {} 