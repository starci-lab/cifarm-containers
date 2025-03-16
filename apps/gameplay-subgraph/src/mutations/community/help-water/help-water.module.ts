import { Module } from "@nestjs/common"
import { HelpWaterResolver } from "./help-water.resolver"
import { HelpWaterService } from "./help-water.service"

 
@Module({
    providers: [HelpWaterService, HelpWaterResolver]
})
export class HelpWaterModule {}
