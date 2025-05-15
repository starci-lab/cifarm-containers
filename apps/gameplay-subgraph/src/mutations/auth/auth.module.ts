import { Module } from "@nestjs/common"
import { RefreshModule } from "./refresh"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { GenerateSignatureModule } from "./generate-signature"
import { LogoutModule } from "./logout"

@Module({
    imports: [
        GenerateSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        RefreshModule,
        LogoutModule,
    ]
})
export class AuthModule {}
