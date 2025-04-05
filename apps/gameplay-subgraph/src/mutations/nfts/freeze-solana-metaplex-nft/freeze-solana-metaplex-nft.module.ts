import { Module } from "@nestjs/common"
import { FreezeSolanaMetaplexNFTService } from "./freeze-solana-metaplex-nft.service"
import { FreezeSolanaMetaplexNFTResolver } from "./freeze-solana-metaplex-nft.resolver"

@Module({
    providers: [
        FreezeSolanaMetaplexNFTService,
        FreezeSolanaMetaplexNFTResolver
    ]
})
export class FreezeSolanaMetaplexNFTModule {}
