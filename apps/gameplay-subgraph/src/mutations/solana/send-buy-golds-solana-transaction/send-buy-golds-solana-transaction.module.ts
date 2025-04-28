import { Module } from "@nestjs/common"
import { SendBuyGoldsSolanaTransactionService } from "./send-buy-golds-solana-transaction.service"
import { SendBuyGoldsSolanaTransactionResolver } from "./send-buy-golds-solana-transaction.resolver"

@Module({
    providers: [
        SendBuyGoldsSolanaTransactionService,
        SendBuyGoldsSolanaTransactionResolver
    ]
})
export class SendBuyGoldsSolanaTransactionModule {}
