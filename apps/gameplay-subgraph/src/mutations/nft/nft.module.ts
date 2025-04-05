import { Module } from "@nestjs/common"

import { FreezeSolanaMetaplexNFTModule } from "./freeze-solana-metaplex-nft"
import { ValidateSolanaMetaplexNFTFrozenModule } from "./validate-solana-metaplex-nft-frozen"
import { UnfreezeSolanaMetaplexNFTModule } from "./unfreeze-solana-metaplex-nft"

@Module({
    imports: [FreezeSolanaMetaplexNFTModule, ValidateSolanaMetaplexNFTFrozenModule, UnfreezeSolanaMetaplexNFTModule]
})
export class NFTModule {}
