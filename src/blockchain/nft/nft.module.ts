import { DynamicModule, Module } from "@nestjs/common"
import { SolanaMetaplexService } from "./solana"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./nft.module-definition"

@Module({
    providers: [
        SolanaMetaplexService
    ],
    exports: [
        SolanaMetaplexService
    ],
})
export class NFTModule extends ConfigurableModuleClass {
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        return super.register(options)
    }
}
