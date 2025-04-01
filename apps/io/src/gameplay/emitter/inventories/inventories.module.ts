import { Module } from "@nestjs/common"
import { InventoriesConsumer } from "./inventories.consumer"
import { InventoriesGateway } from "./inventories.gateway"
import { AuthModule } from "../../auth"
@Module({
    imports: [ AuthModule ],
    exports: [InventoriesGateway],
    providers: [ InventoriesGateway, InventoriesConsumer ]
})
export class InventoriesModule {}
