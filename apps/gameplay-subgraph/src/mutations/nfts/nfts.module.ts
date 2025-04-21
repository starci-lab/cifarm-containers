import { Module } from "@nestjs/common"

import { FreezeSolanaMetaplexNFTModule } from "./freeze-solana-metaplex-nft"
import { ValidateSolanaMetaplexNFTFrozenModule } from "./validate-solana-metaplex-nft-frozen"
import { UnfreezeSolanaMetaplexNFTModule } from "./unfreeze-solana-metaplex-nft"
import { PurchaseSolanaNFTStarterBoxModule } from "./purchase-solana-nft-starter-box"

@Module({
    imports: [
        FreezeSolanaMetaplexNFTModule,
        ValidateSolanaMetaplexNFTFrozenModule,
        UnfreezeSolanaMetaplexNFTModule,
        PurchaseSolanaNFTStarterBoxModule
    ]
})
export class NFTsModule {}
