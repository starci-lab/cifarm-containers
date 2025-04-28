import { Module } from "@nestjs/common"
import { CreateBuyGoldsSolanaTransactionService } from "./create-buy-golds-solana-transaction.service"
import { CreateBuyGoldsSolanaTransactionResolver } from "./create-buy-golds-solana-transaction.resolver"

@Module({
    providers: [
        CreateBuyGoldsSolanaTransactionService,
        CreateBuyGoldsSolanaTransactionResolver
    ]
})
export class CreateBuyGoldsSolanaTransactionModule {}
