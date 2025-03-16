import { Module } from "@nestjs/common"
import { WaterCropResolver } from "./water-crop.resolver"
import { WaterCropService } from "./water-crop.service"

@Module({
    providers: [WaterCropService, WaterCropResolver],
})
export class WaterCropModule {}
