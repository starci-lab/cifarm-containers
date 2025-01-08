import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { HelpCureAnimalController } from "./help-cure-animal.controller"
import { HelpCureAnimalService } from "./help-cure-animal.service"

@Global()
@Module({
    imports: [GameplayModule],
    providers: [HelpCureAnimalService],
    exports: [HelpCureAnimalService],
    controllers: [HelpCureAnimalController]
})
export class HelpCureAnimalModule {}
