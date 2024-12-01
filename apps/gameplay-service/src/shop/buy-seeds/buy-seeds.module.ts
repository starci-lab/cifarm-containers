import { Global, Module } from "@nestjs/common"
import { GoldBalanceModule, InventoryModule } from "@src/services"
import { BuySeedsController } from "./buy-seeds.controller"
import { BuySeedsService } from "./buy-seeds.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        InventoryModule,
        GoldBalanceModule
    ],
    providers: [BuySeedsService],
    exports: [BuySeedsService],
    controllers: [BuySeedsController]
})
export class BuySeedsModule {}
