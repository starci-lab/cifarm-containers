import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { HarvestCropService } from "./harvest-crop.service"
import { typeOrmForFeature } from "@src/dynamic-modules"
import { HarvestCropController } from "./harvest-crop.controller"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [HarvestCropController],
    providers: [HarvestCropService],
    exports: [HarvestCropService]
})
export class HarvestCropModule {}
