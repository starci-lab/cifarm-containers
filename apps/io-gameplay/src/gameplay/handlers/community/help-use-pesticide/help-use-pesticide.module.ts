import { Module } from "@nestjs/common"
import { HelpUsePesticideGateway } from "./help-use-pesticide.gateway"
import { HelpUsePesticideService } from "./help-use-pesticide.service"

@Module({
    providers: [HelpUsePesticideService, HelpUsePesticideGateway],
})
export class HelpUsePesticideModule {} 