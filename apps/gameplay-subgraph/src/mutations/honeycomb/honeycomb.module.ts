import { Module } from "@nestjs/common"
import { ClaimHoneycombDailyRewardModule } from "./claim-honeycomb-daily-reward"
import { MintOffchainTokensModule } from "./mint-offchain-tokens"
import { WrapSolanaMetaplexNFTModule } from "./wrap-solana-metaplex-nft"

@Module({
    imports: [ClaimHoneycombDailyRewardModule, MintOffchainTokensModule, WrapSolanaMetaplexNFTModule]
})
export class HoneycombModule {}
