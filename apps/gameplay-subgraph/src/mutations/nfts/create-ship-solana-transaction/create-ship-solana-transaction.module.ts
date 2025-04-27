import { Module } from "@nestjs/common"
import { CreateShipSolanaTransactionService } from "./create-ship-solana-transaction.service"
import { CreateShipSolanaTransactionResolver } from "./create-ship-solana-transaction.resolver"

@Module({
    providers: [
        CreateShipSolanaTransactionService,
        CreateShipSolanaTransactionResolver
    ]
})
export class CreateShipSolanaTransactionModule {}
