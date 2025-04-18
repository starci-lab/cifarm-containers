import { DynamicModule, Module } from "@nestjs/common"
import { EnergyService } from "./energy"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./gameplay.module-definition"
import { InventoryService } from "./inventory"
import { LevelService } from "./level"
import { ThiefService } from "./thief"
import { GoldBalanceService, TokenBalanceService } from "./wallet"
import { CoreService } from "./core"
import { PositionService } from "./position"
import { NestExport, NestImport, NestProvider, NestService } from "@src/common"
import { StaticService } from "./static"
import { SyncService } from "./sync"
import { ObjectModule } from "@src/object"
import { LimitService } from "./limit"
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
            TokenBalanceService,
            InventoryService,
            CoreService,
            PositionService,
            SyncService,
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
            ...dynamicModule,
            imports,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}

// const dynamicModule = super.register(options)

// const imports: Array<NestImport> = []
// const providers: Array<NestProvider> = []
// const exports: Array<NestExport> = []

// if (!options.useGlobalImports) {
//     imports.push(BlockchainModule.register())
// }

// providers.push(HoneycombService)
// exports.push(HoneycombService)

// return {
//     ...dynamicModule,
//     providers: [...dynamicModule.providers, ...providers],
//     imports,
//     exports
// }