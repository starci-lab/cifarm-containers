import { Global, Module } from "@nestjs/common"
import { GameplayModule } from "@src/gameplay"
import { HelpUsePesticideController } from "./help-use-pesticide.controller"
import { HelpUsePesticideService } from "./help-use-pesticide.service"

@Global()
@Module({
    imports: [GameplayModule],
    providers: [HelpUsePesticideService],
    exports: [HelpUsePesticideService],
    controllers: [HelpUsePesticideController]
})
export class HelpUsePesticideModule {}
