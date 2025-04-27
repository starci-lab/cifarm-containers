import { Module } from "@nestjs/common"

import { FreezeSolanaMetaplexNFTModule } from "./freeze-solana-metaplex-nft"
import { ValidateSolanaMetaplexNFTFrozenModule } from "./validate-solana-metaplex-nft-frozen"
import { UnfreezeSolanaMetaplexNFTModule } from "./unfreeze-solana-metaplex-nft"
import { PurchaseSolanaNFTStarterBoxModule } from "./purchase-solana-nft-starter-box"
import { CreatePurchaseSolanaNFTStarterBoxTransactionModule } from "./create-purchase-solana-nft-starter-box-transaction"
import { SendPurchaseSolanaNFTStarterBoxTransactionModule } from "./send-purchase-solana-nft-starter-box-transaction"
import { CreateShipSolanaTransactionModule } from "./create-ship-solana-transaction"
import { SendShipSolanaTransactionModule } from "./send-ship-solana-transaction"

@Module({
    imports: [
        FreezeSolanaMetaplexNFTModule,
        ValidateSolanaMetaplexNFTFrozenModule,
        UnfreezeSolanaMetaplexNFTModule,
        PurchaseSolanaNFTStarterBoxModule,
        CreatePurchaseSolanaNFTStarterBoxTransactionModule,
        SendPurchaseSolanaNFTStarterBoxTransactionModule,
        CreateShipSolanaTransactionModule,
        SendShipSolanaTransactionModule
    ]
})
export class NFTsModule {}
