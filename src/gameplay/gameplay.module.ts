import { DynamicModule, Module } from "@nestjs/common"
import { EnergyService } from "./energy"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gameplay.module-definition"
import { InventoryService } from "./inventory"
import { LevelService } from "./level"
import { ThiefService } from "./thief"
import { GoldBalanceService, TCIFARMBalanceService } from "./wallet"
import { CoreService } from "./core"
import { PositionService } from "./position"
import { NestExport, NestImport, NestProvider, NestService } from "@src/common"
import { StaticService } from "./static"
import { SyncService } from "./sync"
import { ObjectModule } from "@src/object"
import { LimitService } from "./limit"
import { ShipService } from "./ship"
import { VaultService } from "./vault"
import { AssistanceService } from "./assistance"
import { UsernameService } from "./username"

@Module({})
export class GameplayModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE) : DynamicModule {
        const dynamicModule = super.register(options)
        const loadStatic = options.loadStatic || true
        const loadLimit = options.loadLimit || true
        // services that are always loaded
        const services: Array<NestService> = [
            LevelService,
            ThiefService,
            EnergyService,
            GoldBalanceService,
            InventoryService,
            CoreService,
            PositionService,
            SyncService,
            ShipService,
            TCIFARMBalanceService,
            VaultService,
            AssistanceService,
            UsernameService
        ]
        if (loadStatic) {
            // services that are loaded if static is enabled
            services.push(StaticService)
        }
        if (loadLimit) {
            // services that are loaded if limit is enabled
            services.push(LimitService)
        }
        const imports: Array<NestImport> = []
        const providers: Array<NestProvider> = services
        const exports: Array<NestExport> = services

        if (!options.useGlobalImports) {
            imports.push(ObjectModule.register({}))
        }

        return {
            global: options.isGlobal,
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}