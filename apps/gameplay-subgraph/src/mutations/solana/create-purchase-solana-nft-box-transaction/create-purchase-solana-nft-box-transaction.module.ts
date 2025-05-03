import { Module } from "@nestjs/common"
import { CreatePurchaseSolanaNFTBoxTransactionService } from "./create-purchase-solana-nft-box-transaction.service"
import { CreatePurchaseSolanaNFTBoxTransactionResolver } from "./create-purchase-solana-nft-box-transaction.resolver"

@Module({
    providers: [
        CreatePurchaseSolanaNFTBoxTransactionService,
        CreatePurchaseSolanaNFTBoxTransactionResolver
    ]
})
export class CreatePurchaseSolanaNFTBoxTransactionModule {}
