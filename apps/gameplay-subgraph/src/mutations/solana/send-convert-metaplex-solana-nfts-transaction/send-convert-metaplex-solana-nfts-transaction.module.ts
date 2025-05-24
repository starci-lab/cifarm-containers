import { Module } from "@nestjs/common"
import { SendConvertSolanaMetaplexNFTsTransactionService } from "./send-convert-metaplex-solana-nfts-transaction.service"
import { SendConvertSolanaMetaplexNFTsTransactionResolver } from "./send-convert-metaplex-solana-nfts-transaction.resolver"

@Module({
    providers: [
        SendConvertSolanaMetaplexNFTsTransactionService,
        SendConvertSolanaMetaplexNFTsTransactionResolver
    ]
})
export class SendConvertSolanaMetaplexNFTsTransactionModule {}
