import { Module } from "@nestjs/common"
import { HelpUseBugNetGateway } from "./help-use-bug-net.gateway"
import { HelpUseBugNetService } from "./help-use-bug-net.service"

@Module({
    providers: [HelpUseBugNetService, HelpUseBugNetGateway],
})
export class HelpUseBugNetModule {} 