import { DynamicModule, Module, Provider, Type } from "@nestjs/common"
import { AptosAuthService } from "./aptos-auth.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./auth.module-definition"
import { EvmAuthService } from "./evm-auth.service"
import { NearAuthService } from "./near-auth.service"
import { PolkadotAuthService } from "./polkadot-auth.service"
import { SolanaAuthService } from "./solana-auth.service"
import { NestProvider } from "@src/common"
import { getBlockchainAuthServiceToken } from "./auth.utils"
import { Platform } from "../blockchain.config"

@Module({})
export class AuthModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const providers: Array<NestProvider> = []
        const exports: Array<NestProvider> = []

        const map: Record<Platform, Type> = {
            [Platform.Algorand]: EvmAuthService,
            [Platform.Aptos]: AptosAuthService,
            [Platform.Evm]: EvmAuthService,
            [Platform.Near]: NearAuthService,
            [Platform.Polkadot]: PolkadotAuthService,
            [Platform.Solana]: SolanaAuthService
        }

        for (const [key, value] of Object.entries(map)) {
            const provider: Provider = {
                provide: getBlockchainAuthServiceToken(key as Platform),
                useClass: value
            }
            providers.push(provider)
            exports.push(provider)
        }
        const dynamicModule = super.register(options)

        return {
            ...dynamicModule,
            providers: [...dynamicModule.providers, ...providers],
            exports
        }
    }
}
