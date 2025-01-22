import { Module } from "@nestjs/common"
import { HelpUseHerbicideController } from "./help-use-herbicide.controller"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"

 
@Module({
    providers: [HelpUseHerbicideService],
    controllers: [HelpUseHerbicideController]
})
export class HelpUseHerbicideModule {}
