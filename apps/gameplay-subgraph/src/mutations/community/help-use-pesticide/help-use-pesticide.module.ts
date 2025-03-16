import { Module } from "@nestjs/common"
import { HelpUsePesticideResolver } from "./help-use-pesticide.resolver"
import { HelpUsePesticideService } from "./help-use-pesticide.service"

 
@Module({
    providers: [HelpUsePesticideService, HelpUsePesticideResolver]
})
export class HelpUsePesticideModule {}