import { Global, Module } from "@nestjs/common"
import { HelpWaterController } from "./help-water.controller"
import { HelpWaterService } from "./help-water.service"
import { EnergyModule, LevelModule } from "@src/services"
import { typeOrmForFeature } from "@src/dynamic-modules"

@Global()
@Module({
    imports: [
        typeOrmForFeature(),
        EnergyModule,
        LevelModule
    ],
    providers: [HelpWaterService],
    exports: [HelpWaterService],
    controllers: [HelpWaterController]
})
export class HelpWaterModule {}
