import { Module } from "@nestjs/common"
import { CreateBuyEnergySolanaTransactionService } from "./create-buy-energy-solana-transaction.service"
import { CreateBuyEnergySolanaTransactionResolver } from "./create-buy-energy-solana-transaction.resolver"

@Module({
    providers: [
        CreateBuyEnergySolanaTransactionService,
        CreateBuyEnergySolanaTransactionResolver
    ]
})
export class CreateBuyEnergySolanaTransactionModule {}
