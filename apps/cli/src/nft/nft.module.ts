import { Module } from "@nestjs/common"
import { NFTCommand } from "./nft.command"
import { CreateSolanaMetaplexCollectionModule } from "./create-solana-metaplex-collection"
import { TransferSolanaMetaplexNFTModule } from "./transfer-solana-metaplex-nft"

@Module({
    imports: [
        CreateSolanaMetaplexCollectionModule,
        TransferSolanaMetaplexNFTModule
    ],
    providers: [NFTCommand]
})
export class NFTModule {}
