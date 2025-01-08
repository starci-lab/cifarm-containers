import { Module } from "@nestjs/common"
import { AlgorandAuthService } from "./algorand-auth.service"
import { AptosAuthService } from "./aptos-auth.service"
import { ConfigurableModuleClass } from "./auth.module-definition"
import { EvmAuthService } from "./evm-auth.service"
import { NearAuthService } from "./near-auth.service"
import { PolkadotAuthService } from "./polkadot-auth.service"
import { SolanaAuthService } from "./solana-auth.service"

@Module({
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
export class AuthModule extends ConfigurableModuleClass {}
