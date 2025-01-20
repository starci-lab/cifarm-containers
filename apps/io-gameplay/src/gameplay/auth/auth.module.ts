import { Module } from "@nestjs/common"
import { AuthGateway } from "./auth.gateway"

@Module({
    providers: [AuthGateway],
    exports: [AuthGateway]
})
export class AuthModule {}