import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideController } from "./use-herbicide.controller"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UseHerbicideController],
    providers: [UseHerbicideService],
    exports: [UseHerbicideService]
})
export class UseHerbicideModule {}
