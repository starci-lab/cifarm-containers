import { Module } from "@nestjs/common"
import { HelpWaterCropResolver } from "./help-water-crop.resolver"
import { HelpWaterCropService } from "./help-water-crop.service"

 
@Module({
    providers: [HelpWaterCropService, HelpWaterCropResolver]
})
export class HelpWaterCropModule {}
