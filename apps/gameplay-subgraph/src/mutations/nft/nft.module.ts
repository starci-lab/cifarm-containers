import { Module } from "@nestjs/common"

import { FreezeSolanaMetaplexNFTModule } from "./freeze-solana-metaplex-nft"

@Module({
    imports: [FreezeSolanaMetaplexNFTModule]
})
export class NFTModule {}
