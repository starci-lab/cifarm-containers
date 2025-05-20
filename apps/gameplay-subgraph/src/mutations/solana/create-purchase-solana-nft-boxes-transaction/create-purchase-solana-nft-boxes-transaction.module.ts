import { Module } from "@nestjs/common"
import { CreatePurchaseSolanaNFTBoxesTransactionService } from "./create-purchase-solana-nft-boxes-transaction.service"
import { CreatePurchaseSolanaNFTBoxesTransactionResolver } from "./create-purchase-solana-nft-boxes-transaction.resolver"

@Module({
    providers: [
        CreatePurchaseSolanaNFTBoxesTransactionService,
        CreatePurchaseSolanaNFTBoxesTransactionResolver
    ]
})
export class CreatePurchaseSolanaNFTBoxesTransactionModule {}
