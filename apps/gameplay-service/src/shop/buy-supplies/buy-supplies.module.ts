import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"

@Module({
    imports: [
        GameplayModule
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}
