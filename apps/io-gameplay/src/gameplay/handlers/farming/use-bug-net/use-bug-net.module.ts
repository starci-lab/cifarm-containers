import { Module } from "@nestjs/common"
import { UseBugNetGateway } from "./use-bug-net.gateway"
import { UseBugNetService } from "./use-bug-net.service"

@Module({
    providers: [
        UseBugNetGateway,
        UseBugNetService
    ],
    exports: [
        UseBugNetService
    ]
})
export class UseBugNetModule {} 