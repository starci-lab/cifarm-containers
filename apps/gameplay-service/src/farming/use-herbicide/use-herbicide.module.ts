import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/gameplay"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { UseHerbicideService } from "./use-herbicide.service"
import { UseHerbicideController } from "./use-herbicide.controller"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule,
        InventoryModule
    ],
    controllers: [UseHerbicideController],
    providers: [UseHerbicideService],
    exports: [UseHerbicideService]
})
export class UseHerbicideModule {}
