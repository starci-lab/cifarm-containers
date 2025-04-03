import { DynamicModule, Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./blockchain.module-definition"
import { NFTModule } from "./nft"
import { SpecialModule } from "./special"
import { TokenModule } from "./token"
import { CoreModule } from "./core"
import { PinataModule } from "@src/pinata"

@Module({})
export class BlockchainModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}): DynamicModule {
        const dynamicModule = super.register(options)

        const isGlobal = options.isGlobal || false

        const imports: Array<DynamicModule> = []
        const exports: Array<DynamicModule> = []

        const authDynamicModule = AuthModule.register({ isGlobal })
        const nftDynamicModule = NFTModule.register({ isGlobal })
        const specialDynamicModule = SpecialModule.register({ isGlobal })
        const tokenDynamicModule = TokenModule.register({ isGlobal })
        const coreDynamicModule = CoreModule.register({ isGlobal })

        if (!options.useGlobalImports) {
            imports.push(
                PinataModule.register({
                    isGlobal: true,
                }))
        }
        
        imports.push(authDynamicModule, nftDynamicModule, specialDynamicModule, tokenDynamicModule, coreDynamicModule)
        exports.push(authDynamicModule, nftDynamicModule, specialDynamicModule, tokenDynamicModule, coreDynamicModule)

        return {
            ...dynamicModule,
            imports,
            exports
        }
    }
}
