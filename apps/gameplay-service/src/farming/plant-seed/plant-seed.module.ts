import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { PlantSeedController } from "./plant-seed.controller"
import { PlantSeedService } from "./plant-seed.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        GameplayModule
    ],
    controllers: [PlantSeedController],
    providers: [PlantSeedService],
    exports: [PlantSeedService]
})
export class PlantSeedModule {}
