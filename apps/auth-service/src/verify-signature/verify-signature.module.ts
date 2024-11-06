import { Global, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { HealthcheckEntity } from "@src/database"
import { VerifySignatureService } from "./verify-signature.service"
import { RequestMessageService } from "../request-message"
import {
    AlgorandAuthService,
    AptosAuthService,
    EvmAuthService,
    NearAuthService,
    PolkadotAuthService,
    SolanaAuthService,
} from "@src/services"
import { JwtService } from "@nestjs/jwt"

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([HealthcheckEntity])],
    controllers: [],
    providers: [
        EvmAuthService,
        SolanaAuthService,
        AptosAuthService,
        NearAuthService,
        AlgorandAuthService,
        PolkadotAuthService,
        RequestMessageService,
        VerifySignatureService,
        JwtService,
    ],
    exports: [VerifySignatureService],
})
export class GenerateTestSignatureModule {}
