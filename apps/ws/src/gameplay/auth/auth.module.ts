import { Module } from "@nestjs/common"
import { AuthGateway } from "./auth.gateway"
import { ConfigurableModuleClass } from "./auth.module-definition"

@Module({
    providers: [AuthGateway],
    exports: [AuthGateway]
})
export class AuthModule extends ConfigurableModuleClass {}