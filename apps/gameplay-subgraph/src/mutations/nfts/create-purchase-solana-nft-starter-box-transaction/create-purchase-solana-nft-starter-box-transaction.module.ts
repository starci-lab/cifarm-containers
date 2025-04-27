import { Module } from "@nestjs/common"
import { CreatePurchaseSolanaNFTStarterBoxTransactionService } from "./create-purchase-solana-nft-starter-box-transaction.service"
import { CreatePurchaseSolanaNFTStarterBoxTransactionResolver } from "./create-purchase-solana-nft-starter-box-transaction.resolver"

@Module({
    providers: [
        CreatePurchaseSolanaNFTStarterBoxTransactionService,
        CreatePurchaseSolanaNFTStarterBoxTransactionResolver
    ]
})
export class CreatePurchaseSolanaNFTStarterBoxTransactionModule {}
