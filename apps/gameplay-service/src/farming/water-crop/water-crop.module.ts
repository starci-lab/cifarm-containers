import { Module } from "@nestjs/common"
import { WaterCropController } from "./water-crop.controller"
import { WaterCropService } from "./water-crop.service"

@Module({
    providers: [WaterCropService],
    controllers: [WaterCropController],
})
export class WaterCropModule {}
