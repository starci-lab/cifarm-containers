import { Module } from "@nestjs/common"
import { SendPurchaseSolanaNFTBoxesTransactionService } from "./send-purchase-solana-nft-boxes-transaction.service"
import { SendPurchaseSolanaNFTBoxesTransactionResolver } from "./send-purchase-solana-nft-boxes-transaction.resolver"

@Module({
    providers: [
        SendPurchaseSolanaNFTBoxesTransactionService,
        SendPurchaseSolanaNFTBoxesTransactionResolver
    ]
})
export class SendPurchaseSolanaNFTBoxesTransactionModule {}
