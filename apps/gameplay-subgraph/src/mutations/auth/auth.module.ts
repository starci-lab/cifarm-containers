import { Module } from "@nestjs/common"
import { RefreshModule } from "./refresh"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { GenerateSignatureModule } from "./generate-signature"
import { AuthenticateGoogleModule } from "./authenticate-google"
@Module({
    imports: [
        AuthenticateGoogleModule,
        GenerateSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        RefreshModule,
    ]
})
export class AuthModule {}
