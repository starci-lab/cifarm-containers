import { DynamicModule, Module } from "@nestjs/common"
import { EnergyService } from "./energy"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gameplay.module-definition"
import { InventoryService } from "./inventory"
import { LevelService } from "./level"
import { ThiefService } from "./thief"
import { GoldBalanceService, TokenBalanceService } from "./wallet"
import { ProductService } from "./product"
import { TutorialService } from "./tutorial"
import { PositionService } from "./position"

@Module({
    providers: [
        LevelService,
        ThiefService,
        EnergyService,
        GoldBalanceService,
        TokenBalanceService,
        InventoryService,
        ProductService,
        TutorialService,
        PositionService
    ],
    exports: [
        LevelService,
        ThiefService,
        EnergyService,
        GoldBalanceService,
        TokenBalanceService,
        InventoryService,
        ProductService,
        TutorialService,
        PositionService
    ]
})
export class GameplayModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        return super.register(options)
    }
}
