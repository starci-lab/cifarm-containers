import { Module } from "@nestjs/common"
import { NFTCommand } from "./nft.command"
import { CreateSolanaMetaplexCollectionModule } from "./create-solana-metaplex-collection"
import { MintSolanaMetaplexNFTModule } from "./mint-solana-metaplex-nft"

@Module({
    imports: [ CreateSolanaMetaplexCollectionModule, MintSolanaMetaplexNFTModule ],
    providers: [NFTCommand]
})
export class NFTModule {}
