import { Global, Module } from "@nestjs/common"
import { GoldBalanceModule, InventoryModule, TokenBalanceModule,  } from "@src/services"
import { SpinController } from "./spin.controller"
import { SpinService } from "./spin.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        GoldBalanceModule,
        TokenBalanceModule,
        InventoryModule
    ],
    providers: [SpinService],
    exports: [SpinService],
    controllers: [SpinController]
})
export class SpinModule {}
