import { Module } from "@nestjs/common"
import { GenerateTestSignatureModule } from "./generate-test-signature"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { AuthModule as BlockchainAuthModule } from "@src/blockchain"
import { JwtModule } from "@src/services"
import { RefreshModule } from "./refresh"

@Module({
    imports: [
        GenerateTestSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        BlockchainAuthModule,
        RefreshModule,
        JwtModule
    ]
})
export class AuthModule {}
