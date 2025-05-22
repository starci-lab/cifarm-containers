import { Module } from "@nestjs/common"
import { CreatePurchaseSuiNFTBoxesTransactionModule } from "./create-purchase-sui-nft-boxes-transaction"
@Module({
    imports: [
        CreatePurchaseSuiNFTBoxesTransactionModule
    ]
})
export class SuiModule {}
