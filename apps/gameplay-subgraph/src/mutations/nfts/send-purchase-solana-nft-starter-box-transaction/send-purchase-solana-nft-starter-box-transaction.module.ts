import { Module } from "@nestjs/common"
import { SendPurchaseSolanaNFTStarterBoxTransactionService } from "./send-purchase-solana-nft-starter-box-transaction.service"
import { SendPurchaseSolanaNFTStarterBoxTransactionResolver } from "./send-purchase-solana-nft-starter-box-transaction.resolver"

@Module({
    providers: [
        SendPurchaseSolanaNFTStarterBoxTransactionService,
        SendPurchaseSolanaNFTStarterBoxTransactionResolver
    ]
})
export class SendPurchaseSolanaNFTStarterBoxTransactionModule {}
