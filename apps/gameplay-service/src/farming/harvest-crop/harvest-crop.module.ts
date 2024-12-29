import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { HarvestCropService } from "./harvest-crop.service"
import { HarvestCropController } from "./harvest-crop.controller"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [HarvestCropController],
    providers: [HarvestCropService],
    exports: [HarvestCropService]
})
export class HarvestCropModule {}
