import { Module } from "@nestjs/common"
import { UnfreezeSolanaMetaplexNFTService } from "./unfreeze-solana-metaplex-nft.service"
import { UnfreezeSolanaMetaplexNFTResolver } from "./unfreeze-solana-metaplex-nft.resolver"

@Module({
    providers: [
        UnfreezeSolanaMetaplexNFTService,
        UnfreezeSolanaMetaplexNFTResolver
    ]
})
export class UnfreezeSolanaMetaplexNFTModule {}
