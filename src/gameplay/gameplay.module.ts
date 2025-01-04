import { Module } from "@nestjs/common"
import { LevelService } from "./level"
import { ThiefService } from "./thief"
import { GoldBalanceService, TokenBalanceService } from "./wallet"
import { InventoryService } from "./inventory"
import { EnergyService } from "./energy"

@Module({
    providers: [
        LevelService,
        ThiefService,
        EnergyService,
        GoldBalanceService,
        TokenBalanceService,
        InventoryService
    ],
    exports: [
        LevelService,
        ThiefService,
        EnergyService,
        GoldBalanceService,
        TokenBalanceService,
        InventoryService
    ]
})
export class GameplayModule {}
