import { Global, Module } from "@nestjs/common"
import { InventoryModule, WalletModule } from "@src/services"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        WalletModule,
        InventoryModule
    ],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}
