import { Module } from "@nestjs/common"
import { HelpWaterController } from "./help-water.controller"
import { HelpWaterService } from "./help-water.service"

 
@Module({
    providers: [HelpWaterService],
    controllers: [HelpWaterController]
})
export class HelpWaterModule {}
