import { Module } from "@nestjs/common"
import { ThiefCropResolver } from "./thief-crop.resolver"
import { ThiefCropService } from "./thief-crop.service"

 
@Module({
    providers: [ThiefCropService, ThiefCropResolver]
})
export class ThiefCropModule {}
