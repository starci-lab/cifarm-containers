import { Module } from "@nestjs/common"
import { WrapSolanaMetaplexNFTService } from "./wrap-solana-metaplex-nft.service"
import { WrapSolanaMetaplexNFTResolver } from "./wrap-solana-metaplex-nft.resolver"

@Module({
    providers: [WrapSolanaMetaplexNFTService, WrapSolanaMetaplexNFTResolver]
})
export class WrapSolanaMetaplexNFTModule {}
