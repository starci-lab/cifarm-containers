import { Global, Module } from "@nestjs/common"
import { AlgorandAuthService } from "./algorand-auth.service"
import { AptosAuthService } from "./aptos-auth.service"
import { EvmAuthService } from "./evm-auth.service"
import { PolkadotAuthService } from "./polkadot-auth.service"
import { SolanaAuthService } from "./solana-auth.service"
import { NearAuthService } from "./near-auth.service"

@Global()
@Module({
    imports: [],
    providers: [
        EvmAuthService,
        AptosAuthService,
        SolanaAuthService,
        AlgorandAuthService,
        PolkadotAuthService,
        NearAuthService
    ],
    exports: [
        EvmAuthService,
        AptosAuthService,
        SolanaAuthService,
        AlgorandAuthService,
        PolkadotAuthService,
        NearAuthService
    ],
})
export class AuthModule {}
