import { Module } from "@nestjs/common"
import { EnergyModule } from "./energy"
import { LevelModule } from "./level"
import { ThiefModule } from "./thief"
import { GoldBalanceModule, TokenBalanceModule } from "./wallet"
import { InventoryModule } from "./inventory"

@Module({
    imports: [
        EnergyModule,
        InventoryModule,
        LevelModule,
        ThiefModule,
        GoldBalanceModule,
        TokenBalanceModule
    ]
})
export class GameplayModule {}
