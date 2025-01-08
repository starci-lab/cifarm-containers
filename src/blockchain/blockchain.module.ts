import { Module } from "@nestjs/common"
import { AuthModule } from "./auth"
import { ConfigurableModuleClass } from "./blockchain.module-definition"
import { NftModule } from "./nft"
import { SpecialModule } from "./special"
import { TokenModule } from "./token"

@Module({
    imports: [AuthModule, SpecialModule, NftModule, TokenModule],
    providers: [],
    exports: [AuthModule, SpecialModule, NftModule, TokenModule]
})
export class BlockchainModule extends ConfigurableModuleClass {}
