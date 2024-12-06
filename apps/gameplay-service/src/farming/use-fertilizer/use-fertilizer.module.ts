import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UseFertilizerController } from "./use-fertilizer.controller"
import { UseFertilizerService } from "./use-fertilizer.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UseFertilizerController],
    providers: [UseFertilizerService],
    exports: [UseFertilizerService]
})
export class UseFertilizerModule {}
