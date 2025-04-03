import { Module } from "@nestjs/common"
import { MintSolanaMetaplexNFTCommand } from "./mint-solana-metaplex-nft.command"


@Module({
    providers: [ MintSolanaMetaplexNFTCommand ],
})
export class MintSolanaMetaplexNFTModule {}