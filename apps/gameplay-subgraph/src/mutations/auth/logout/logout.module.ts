import { Module } from "@nestjs/common"
import { LogoutResolver } from "./logout.resolver"
import { LogoutService } from "./logout.service"

@Module({
    providers: [
        LogoutResolver,
        LogoutService
    ],
})
export class LogoutModule {} 