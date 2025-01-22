import { Module } from "@nestjs/common"
import { HelpUsePesticideController } from "./help-use-pesticide.controller"
import { HelpUsePesticideService } from "./help-use-pesticide.service"

 
@Module({
    providers: [HelpUsePesticideService],
    controllers: [HelpUsePesticideController]
})
export class HelpUsePesticideModule {}
