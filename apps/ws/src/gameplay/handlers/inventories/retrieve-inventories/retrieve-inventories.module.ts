import { Module } from "@nestjs/common"
import { RetrieveInventoriesService } from "./retrieve-inventories.service"
import { RetrieveInventoriesGateway } from "./retrieve-inventories.gateway"

@Module({
    providers: [RetrieveInventoriesService, RetrieveInventoriesGateway]
})
export class RetrieveInventoriesModule {} 