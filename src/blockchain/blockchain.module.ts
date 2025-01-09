import { DynamicModule, Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./blockchain.module-definition"
import { NftModule } from "./nft"
import { SpecialModule } from "./special"
import { TokenModule } from "./token"

@Module({})
export class BlockchainModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const isGlobal = options.isGlobal || false

        const imports: Array<DynamicModule> = []
        const exports: Array<DynamicModule> = []

        const authDynamicModule = AuthModule.register({ isGlobal })
        const nftDynamicModule = NftModule.register({ isGlobal })
        const specialDynamicModule = SpecialModule.register({ isGlobal })
        const tokenDynamicModule = TokenModule.register({ isGlobal })

        imports.push(authDynamicModule, nftDynamicModule, specialDynamicModule, tokenDynamicModule)
        exports.push(authDynamicModule, nftDynamicModule, specialDynamicModule, tokenDynamicModule)

        return {
            ...dynamicModule,
            imports,
            exports
        }
    }
}
