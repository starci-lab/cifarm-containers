import { Module } from "@nestjs/common"
import { HelpUseHerbicideResolver } from "./help-use-herbicide.resolver"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"

 
@Module({
    providers: [HelpUseHerbicideService, HelpUseHerbicideResolver]
})
export class HelpUseHerbicideModule {}
