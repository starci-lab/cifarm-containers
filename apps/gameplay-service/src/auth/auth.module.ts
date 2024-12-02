import { Module } from "@nestjs/common"
import { GenerateTestSignatureModule } from "./generate-test-signature"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { AuthModule as BlockchainAuthModule, JwtModule } from "@src/services"
@Module({
    imports: [
        GenerateTestSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        BlockchainAuthModule,
        JwtModule
    ]
})
export class AuthModule {}
