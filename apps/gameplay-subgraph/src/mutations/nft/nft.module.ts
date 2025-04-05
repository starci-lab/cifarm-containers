import { Module } from "@nestjs/common"

import { FreezeSolanaMetaplexNFTModule } from "./freeze-solana-metaplex-nft"
import { ValidateSolanaMetaplexNFTFrozenModule } from "./validate-solana-metaplex-nft-frozen"

@Module({
    imports: [FreezeSolanaMetaplexNFTModule, ValidateSolanaMetaplexNFTFrozenModule]
})
export class NFTModule {}
