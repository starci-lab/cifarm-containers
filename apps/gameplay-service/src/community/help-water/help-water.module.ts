import { Global, Module } from "@nestjs/common"
import { HelpWaterController } from "./help-water.controller"
import { HelpWaterService } from "./help-water.service"
import { EnergyModule, LevelModule } from "@src/services"
import { GameplayPostgreSQLModule } from "@src/databases"

@Global()
@Module({
    imports: [
        GameplayPostgreSQLModule.forRoot(),
        EnergyModule,
        LevelModule
    ],
    providers: [HelpWaterService],
    exports: [HelpWaterService],
    controllers: [HelpWaterController]
})
export class HelpWaterModule {}
