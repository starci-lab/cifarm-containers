import { Global, Module } from "@nestjs/common"
import { InventoryModule, GoldBalanceModule } from "@src/services"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"
import { GameplayPostgreSQLModule } from "@src/databases"


@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        InventoryModule,
        GoldBalanceModule
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}
