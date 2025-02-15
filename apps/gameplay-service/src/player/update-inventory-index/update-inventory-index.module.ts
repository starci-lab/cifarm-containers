import { Module } from "@nestjs/common"
import { UpdateInventoryIndexService } from "./update-inventory-index.service"
import { UpdateInventoryIndexController } from "./update-inventory-index.controller"


@Module({
    imports: [],
    providers: [UpdateInventoryIndexService],
    exports: [UpdateInventoryIndexService],
    controllers: [UpdateInventoryIndexController]
})
export class UpdateInventoryIndexModule {}
