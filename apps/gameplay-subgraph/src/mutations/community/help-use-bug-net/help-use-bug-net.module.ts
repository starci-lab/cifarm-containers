import { Module } from "@nestjs/common"
import { HelpUseBugNetResolver } from "./help-use-bug-net.resolver"
import { HelpUseBugNetService } from "./help-use-bug-net.service"

 
@Module({
    providers: [HelpUseBugNetService, HelpUseBugNetResolver]
})
export class HelpUseBugNetModule {}
