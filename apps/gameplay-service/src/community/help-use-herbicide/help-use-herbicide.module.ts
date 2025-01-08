import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { HelpUseHerbicideController } from "./help-use-herbicide.controller"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"

@Global()
@Module({
    imports: [GameplayModule],
    providers: [HelpUseHerbicideService],
    exports: [HelpUseHerbicideService],
    controllers: [HelpUseHerbicideController]
})
export class HelpUseHerbicideModule {}
