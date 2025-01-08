import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { HelpWaterController } from "./help-water.controller"
import { HelpWaterService } from "./help-water.service"

@Global()
@Module({
    imports: [GameplayModule],
    providers: [HelpWaterService],
    exports: [HelpWaterService],
    controllers: [HelpWaterController]
})
export class HelpWaterModule {}
