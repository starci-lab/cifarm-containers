import { Module } from "@nestjs/common"
import { HelpUseBugNetController } from "./help-use-bug-net.controller"
import { HelpUseBugNetService } from "./help-use-bug-net.service"

 
@Module({
    providers: [HelpUseBugNetService],
    controllers: [HelpUseBugNetController]
})
export class HelpUseBugNetModule {}
