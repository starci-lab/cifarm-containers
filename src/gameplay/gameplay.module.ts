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
import { NestExport, NestProvider, NestService } from "@src/common"
// import { StaticService } from "./static"
@Module({})
export class GameplayModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE) : DynamicModule {
        const dynamicModule = super.register(options)
        const loadStatic = options.loadStatic || true
        // services that are always loaded
        const services: Array<NestService> = [
            LevelService,
            ThiefService,
            EnergyService,
            GoldBalanceService,
            TokenBalanceService,
            InventoryService,
            ProductService,
            TutorialService,
            PositionService,
        ]
        if (loadStatic) {
            // services that are loaded if static is enabled
            // services.push(StaticService)
        }
        const providers: Array<NestProvider> = services
        const exports: Array<NestExport> = services

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
