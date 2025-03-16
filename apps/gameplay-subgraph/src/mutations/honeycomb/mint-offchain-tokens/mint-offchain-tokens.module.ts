import { Module } from "@nestjs/common"
import { MintOffchainTokensService } from "./mint-offchain-tokens.service"
import { MintOffchainTokensResolver } from "./mint-offchain-tokens.resolver"


@Module({
    imports: [],
    providers: [MintOffchainTokensService, MintOffchainTokensResolver],
})
export class MintOffchainTokensModule {}
