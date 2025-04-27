import { Module } from "@nestjs/common"
import { SendWrapSolanaMetaplexNFTTransactionService } from "./send-wrap-solana-metaplex-nft-transaction.service"
import { SendWrapSolanaMetaplexNFTTransactionResolver } from "./send-wrap-solana-metaplex-nft-transaction.resolver"

@Module({
    providers: [
        SendWrapSolanaMetaplexNFTTransactionService,
        SendWrapSolanaMetaplexNFTTransactionResolver
    ]
})
export class SendWrapSolanaMetaplexNFTTransactionModule {}
