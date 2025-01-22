import { Module } from "@nestjs/common"
import { WaterController } from "./water.controller"
import { WaterService } from "./water.service"

@Module({
    providers: [WaterService],
    controllers: [WaterController],
})
export class WaterModule {}
