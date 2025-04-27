import { Module } from "@nestjs/common"
import { CreateWrapSolanaMetaplexNFTTransactionService } from "./create-wrap-solana-metaplex-nft-transaction.service"
import { CreateWrapSolanaMetaplexNFTTransactionResolver } from "./create-wrap-solana-metaplex-nft-transaction.resolver"

@Module({
    providers: [
        CreateWrapSolanaMetaplexNFTTransactionService,
        CreateWrapSolanaMetaplexNFTTransactionResolver
    ]
})
export class CreateWrapSolanaMetaplexNFTTransactionModule {}
