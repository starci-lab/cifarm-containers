import { Module } from "@nestjs/common"
import { CreateUnwrapSolanaMetaplexNFTTransactionService } from "./create-unwrap-solana-metaplex-nft-transaction.service"
import { CreateUnwrapSolanaMetaplexNFTTransactionResolver } from "./create-unwrap-solana-metaplex-nft-transaction.resolver"

@Module({
    providers: [
        CreateUnwrapSolanaMetaplexNFTTransactionService,
        CreateUnwrapSolanaMetaplexNFTTransactionResolver
    ]
})
export class CreateUnwrapSolanaMetaplexNFTTransactionModule {}
