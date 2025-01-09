import { Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { WaterController } from "./water.controller"
import { WaterService } from "./water.service"

@Module({
    imports: [
        GameplayModule
    ],
    providers: [WaterService],
    exports: [WaterService],
    controllers: [WaterController],
})
export class WaterModule {}
