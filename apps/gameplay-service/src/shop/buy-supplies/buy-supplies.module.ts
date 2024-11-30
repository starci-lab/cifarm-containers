import { Global, Module } from "@nestjs/common"
import { WalletModule, InventoryModule } from "@src/services"
import { BuySuppliesController } from "./buy-supplies.controller"
import { BuySuppliesService } from "./buy-supplies.service"
import { typeOrmForFeature } from "@src/dynamic-modules"


@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        InventoryModule,
        WalletModule
    ],
    providers: [BuySuppliesService],
    exports: [BuySuppliesService],
    controllers: [BuySuppliesController]
})
export class BuySuppliesModule {}
