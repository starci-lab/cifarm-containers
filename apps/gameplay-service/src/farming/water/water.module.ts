import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { WaterService } from "./water.service"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { WaterController } from "./water.controller"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    providers: [WaterService],
    exports: [WaterService],
    controllers: [WaterController],
})
export class WaterModule {}
