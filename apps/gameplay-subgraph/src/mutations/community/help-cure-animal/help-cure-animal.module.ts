import { Module } from "@nestjs/common"
import { HelpCureAnimalResolver } from "./help-cure-animal.resolver"
import { HelpCureAnimalService } from "./help-cure-animal.service"
 
@Module({
    providers: [HelpCureAnimalService, HelpCureAnimalResolver]
})
export class HelpCureAnimalModule {}
