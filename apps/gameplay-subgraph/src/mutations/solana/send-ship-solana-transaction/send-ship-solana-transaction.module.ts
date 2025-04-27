import { Module } from "@nestjs/common"
import { SendShipSolanaTransactionService } from "./send-ship-solana-transaction.service"
import { SendShipSolanaTransactionResolver } from "./send-ship-solana-transaction.resolver"

@Module({
    providers: [
        SendShipSolanaTransactionService,
        SendShipSolanaTransactionResolver
    ]
})
export class SendShipSolanaTransactionModule {}
