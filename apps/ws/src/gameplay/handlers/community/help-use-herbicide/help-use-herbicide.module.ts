import { Module } from "@nestjs/common"
import { HelpUseHerbicideGateway } from "./help-use-herbicide.gateway"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"

@Module({
    providers: [HelpUseHerbicideGateway, HelpUseHerbicideService],
})
export class HelpUseHerbicideModule {} 