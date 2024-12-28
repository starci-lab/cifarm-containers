import { Global, Module } from "@nestjs/common"
import { WalletModule, InventoryModule } from "@src/services"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"
import { GameplayPostgreSQLModule } from "@src/databases"


@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        InventoryModule,
        WalletModule
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}
