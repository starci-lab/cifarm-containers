import { Module } from "@nestjs/common"
import { PurchaseSolanaNFTStarterBoxService } from "./purchase-solana-nft-starter-box.service"
import { PurchaseSolanaNFTStarterBoxResolver } from "./purchase-solana-nft-starter-box.resolver"

@Module({
    providers: [
        PurchaseSolanaNFTStarterBoxService,
        PurchaseSolanaNFTStarterBoxResolver
    ]
})
export class PurchaseSolanaNFTStarterBoxModule {}
