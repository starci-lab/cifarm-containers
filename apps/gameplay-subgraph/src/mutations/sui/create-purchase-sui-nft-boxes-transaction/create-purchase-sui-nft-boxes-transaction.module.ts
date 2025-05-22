import { Module } from "@nestjs/common"
import { CreatePurchaseSolanaNFTBoxesTransactionService } from "./create-purchase-sui-nft-boxes-transaction.service"
import { CreatePurchaseSolanaNFTBoxesTransactionResolver } from "./create-purchase-sui-nft-boxes-transaction.resolver"

@Module({
    providers: [
        CreatePurchaseSolanaNFTBoxesTransactionService,
        CreatePurchaseSolanaNFTBoxesTransactionResolver
    ]
})
export class CreatePurchaseSolanaNFTBoxesTransactionModule {}
