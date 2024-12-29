import { Global, Module } from "@nestjs/common"
import { InventoryModule, LevelModule } from "@src/services"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { CureAnimalController } from "./cure-animal.controller"
import { CureAnimalService } from "./cure-animal.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule,
        InventoryModule,
    ],
    controllers: [CureAnimalController],
    providers: [CureAnimalService],
    exports: [CureAnimalService],
})
export class CureAnimalModule {}
