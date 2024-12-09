import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { PlantSeedController } from "./plant-seed.controller"
import { PlantSeedService } from "./plant-seed.service"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [PlantSeedController],
    providers: [PlantSeedService],
    exports: [PlantSeedService]
})
export class PlantSeedModule {}
