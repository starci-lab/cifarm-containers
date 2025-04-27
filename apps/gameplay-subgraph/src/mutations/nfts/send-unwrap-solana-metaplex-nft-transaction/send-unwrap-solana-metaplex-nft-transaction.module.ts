import { Module } from "@nestjs/common"
import { SendUnwrapSolanaMetaplexNFTTransactionService } from "./send-unwrap-solana-metaplex-nft-transaction.service"
import { SendUnwrapSolanaMetaplexNFTTransactionResolver } from "./send-unwrap-solana-metaplex-nft-transaction.resolver"

@Module({
    providers: [SendUnwrapSolanaMetaplexNFTTransactionService, SendUnwrapSolanaMetaplexNFTTransactionResolver],
})
export class SendUnwrapSolanaMetaplexNFTTransactionModule {} 