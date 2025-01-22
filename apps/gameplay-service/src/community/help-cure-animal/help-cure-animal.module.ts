import { Module } from "@nestjs/common"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"

 
@Module({
    providers: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
