import { Module } from "@nestjs/common"
import { AuthGateway } from "./auth.gateway"
import { WsJwtAuthModule } from "@src/guards"

@Module({
    imports: [
        WsJwtAuthModule
    ],
    controllers: [],
    providers: [AuthGateway]
})
export class AuthModule {}
