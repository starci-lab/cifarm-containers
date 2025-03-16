import { Module } from "@nestjs/common"
import { UseBugNetResolver } from "./use-bug-net.resolver"
import { UseBugNetService } from "./use-bug-net.service"

@Module({
    providers: [UseBugNetService, UseBugNetResolver]
})
export class UseBugNetModule {}
