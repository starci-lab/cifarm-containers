import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/services/gameplay/energy/energy.module"
import { WaterService } from "./water.service"
import { WaterController } from "./water.controller"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    providers: [WaterService],
    exports: [WaterService],
    controllers: [WaterController],
})
export class WaterModule {}
