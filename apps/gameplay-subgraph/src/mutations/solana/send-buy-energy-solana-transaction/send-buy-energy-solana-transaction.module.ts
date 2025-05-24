import { Module } from "@nestjs/common"
import { SendBuyEnergySolanaTransactionService } from "./send-buy-energy-solana-transaction.service"
import { SendBuyEnergySolanaTransactionResolver } from "./send-buy-energy-solana-transaction.resolver"

@Module({
    providers: [
        SendBuyEnergySolanaTransactionService,
        SendBuyEnergySolanaTransactionResolver
    ]
})
export class SendBuyEnergySolanaTransactionModule {}
