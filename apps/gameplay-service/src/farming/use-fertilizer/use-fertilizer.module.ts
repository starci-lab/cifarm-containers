import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { EnergyModule } from "@src/gameplay/energy/energy.module"
import { UseFertilizerController } from "./use-fertilizer.controller"
import { UseFertilizerService } from "./use-fertilizer.service"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        GameplayModule
    ],
    controllers: [UseFertilizerController],
    providers: [UseFertilizerService],
    exports: [UseFertilizerService]
})
export class UseFertilizerModule {}
