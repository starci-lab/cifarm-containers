import { Module } from "@nestjs/common"
import { HarvestCropController } from "./harvest-crop.controller"
import { HarvestCropService } from "./harvest-crop.service"

 
@Module({
    controllers: [HarvestCropController],
    providers: [HarvestCropService]
})
export class HarvestCropModule {}
