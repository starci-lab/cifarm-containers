import { DynamicModule, Module } from "@nestjs/common"
import { BlockchainTokenService } from "./blockchain-token.service"
import { ConfigurableModuleClass, OPTIONS_TYPE } from "./token.module-definition"

@Module({
    providers: [
        BlockchainTokenService
    ],
    exports: [
        BlockchainTokenService
    ],
})
export class TokenModule extends ConfigurableModuleClass{
    static register(options: typeof OPTIONS_TYPE = {}) : DynamicModule {
        return super.register(options)
    }
}
