import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { CureAnimalController } from "./cure-animal.controller"
import { CureAnimalService } from "./cure-animal.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        GameplayModule
    ],
    controllers: [CureAnimalController],
    providers: [CureAnimalService],
    exports: [CureAnimalService],
})
export class CureAnimalModule {}
