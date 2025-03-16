import { Module } from "@nestjs/common"
import { HarvestCropResolver } from "./harvest-crop.resolver"
import { HarvestCropService } from "./harvest-crop.service"

 
@Module({
    providers: [HarvestCropService, HarvestCropResolver]
})
export class HarvestCropModule {}
