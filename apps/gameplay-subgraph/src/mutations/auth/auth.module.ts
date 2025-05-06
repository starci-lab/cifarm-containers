import { Module } from "@nestjs/common"
import { RefreshModule } from "./refresh"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { GenerateSignatureModule } from "./generate-signature"
import { ValidateGoogleTokenModule } from "./validate-google-token"
@Module({
    imports: [
        ValidateGoogleTokenModule,
        GenerateSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        RefreshModule,
    ]
})
export class AuthModule {}
