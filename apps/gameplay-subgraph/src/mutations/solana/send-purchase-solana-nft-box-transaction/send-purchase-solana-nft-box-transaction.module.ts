import { Module } from "@nestjs/common"
import { SendPurchaseSolanaNFTBoxTransactionService } from "./send-purchase-solana-nft-box-transaction.service"
import { SendPurchaseSolanaNFTBoxTransactionResolver } from "./send-purchase-solana-nft-box-transaction.resolver"

@Module({
    providers: [
        SendPurchaseSolanaNFTBoxTransactionService,
        SendPurchaseSolanaNFTBoxTransactionResolver
    ]
})
export class SendPurchaseSolanaNFTBoxTransactionModule {}
