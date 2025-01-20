import { Module } from "@nestjs/common"
import { ThiefCropController } from "./thief-crop.controller"
import { ThiefCropService } from "./thief-crop.service"

 
@Module({
    providers: [ThiefCropService],
    controllers: [ThiefCropController]
})
export class ThiefCropModule {}
