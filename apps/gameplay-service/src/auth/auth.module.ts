import { Module } from "@nestjs/common"
import { BlockchainModule } from "@src/blockchain"
import { JwtModule } from "@src/jwt"
import { GenerateSignatureModule } from "./generate-signature"
import { RefreshModule } from "./refresh"
import { RequestMessageModule } from "./request-message"
import { VerifySignatureModule } from "./verify-signature"

@Module({
    imports: [
        GenerateSignatureModule,
        RequestMessageModule,
        VerifySignatureModule,
        BlockchainModule,
        RefreshModule,
        JwtModule
    ]
})
export class AuthModule {}
