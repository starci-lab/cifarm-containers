import { Module } from "@nestjs/common"
import { SortInventoriesService } from "./sort-inventories.service"
import { SortInventoriesGateway } from "./sort-inventories.gateway"
@Module({
    providers: [SortInventoriesService, SortInventoriesGateway]
})
export class SortInventoriesModule {}
