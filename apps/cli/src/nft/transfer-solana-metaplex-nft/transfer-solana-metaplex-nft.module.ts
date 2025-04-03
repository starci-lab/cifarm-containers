import { Module } from "@nestjs/common"
import { TransferSolanaMetaplexNFTCommand } from "./transfer-solana-metaplex-nft.command"

@Module({
    providers: [ TransferSolanaMetaplexNFTCommand ],
})
export class TransferSolanaMetaplexNFTModule {}