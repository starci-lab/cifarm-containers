import { Module } from "@nestjs/common"
import { GenerateTestSignatureModule } from "./generate-test-signature"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"

@Module({
    imports: [GenerateTestSignatureModule, RequestMessageModule, VerifySignatureModule]
})
export class AuthModule {}
