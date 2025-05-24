import { Module } from "@nestjs/common"
import { CreateConvertSolanaMetaplexNFTsTransactionService } from "./create-convert-solana-metaplex-nfts-transaction.service"
import { CreateConvertSolanaMetaplexNFTsTransactionResolver } from "./create-convert-solana-metaplex-nfts-transaction.resolver"

@Module({
    providers: [
        CreateConvertSolanaMetaplexNFTsTransactionService,
        CreateConvertSolanaMetaplexNFTsTransactionResolver
    ]
})
export class CreateConvertSolanaMetaplexNFTsTransactionModule {}
