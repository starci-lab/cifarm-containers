import { Module } from "@nestjs/common"
import { SendExpandLandLimitSolanaTransactionService } from "./send-expand-land-limit-solana-transaction.service"
import { SendExpandLandLimitSolanaTransactionResolver } from "./send-expand-land-limit-solana-transaction.resolver"

@Module({
    providers: [
        SendExpandLandLimitSolanaTransactionService,
        SendExpandLandLimitSolanaTransactionResolver
    ]
})
export class SendExpandLandLimitSolanaTransactionModule {}
