import { Module } from "@nestjs/common"
import { GenerateSignatureModule } from "./generate-signature"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"
import { AuthModule as BlockchainAuthModule } from "@src/blockchain"
import { RefreshModule } from "./refresh"
import { JwtModule } from "@src/jwt"

@Module({
    imports: [
        GenerateSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        BlockchainAuthModule,
        RefreshModule,
        JwtModule
    ]
})
export class AuthModule {}
