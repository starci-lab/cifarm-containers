import { Module } from "@nestjs/common"
import { CreateExpandLandLimitSolanaTransactionService } from "./create-expand-land-limit-solana-transaction.service"
import { CreateExpandLandLimitSolanaTransactionResolver } from "./create-expand-land-limit-solana-transaction.resolver"

@Module({
    providers: [
        CreateExpandLandLimitSolanaTransactionService,
        CreateExpandLandLimitSolanaTransactionResolver
    ]
})
export class CreateExpandLandLimitSolanaTransactionModule {}
