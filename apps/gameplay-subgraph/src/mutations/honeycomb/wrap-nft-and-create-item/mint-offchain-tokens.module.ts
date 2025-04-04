import { Module } from "@nestjs/common"
import { MintOffchainTokensService } from "./wrap-nft-and-create-item.service"
import { MintOffchainTokensResolver } from "./mint-offchain-tokens.resolver"


@Module({
    imports: [],
    providers: [MintOffchainTokensService, MintOffchainTokensResolver],
})
export class MintOffchainTokensModule {}
