import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { WaterService } from "./water.service"
import { WaterController } from "./water.controller"

@Global()
@Module({
    imports: [
        GameplayModule
    ],
    providers: [WaterService],
    exports: [WaterService],
    controllers: [WaterController],
})
export class WaterModule {}
