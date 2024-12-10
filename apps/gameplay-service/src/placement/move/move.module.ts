import { Global, Module } from "@nestjs/common"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { GoldBalanceModule, InventoryModule } from "@src/services"
import { MoveController } from "./move.controller"
import { MoveService } from "./move.service"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        InventoryModule,
        GoldBalanceModule
    ],
    providers: [MoveService],
    exports: [MoveService],
    controllers: [MoveController]
})
export class MoveModule {}
