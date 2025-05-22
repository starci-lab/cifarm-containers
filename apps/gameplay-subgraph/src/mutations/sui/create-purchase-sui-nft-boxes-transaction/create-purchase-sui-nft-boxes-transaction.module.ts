import { Module } from "@nestjs/common"
import { CreatePurchaseSuiNFTBoxesTransactionService } from "./create-purchase-sui-nft-boxes-transaction.service"
import { CreatePurchaseSuiNFTBoxesTransactionResolver } from "./create-purchase-sui-nft-boxes-transaction.resolver"

@Module({
    providers: [
        CreatePurchaseSuiNFTBoxesTransactionService,
        CreatePurchaseSuiNFTBoxesTransactionResolver
    ]
})
export class CreatePurchaseSuiNFTBoxesTransactionModule {}
