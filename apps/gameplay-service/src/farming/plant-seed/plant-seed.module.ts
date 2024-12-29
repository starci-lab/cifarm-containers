import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { PlantSeedController } from "./plant-seed.controller"
import { PlantSeedService } from "./plant-seed.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [PlantSeedController],
    providers: [PlantSeedService],
    exports: [PlantSeedService]
})
export class PlantSeedModule {}
