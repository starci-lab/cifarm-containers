import { Module } from "@nestjs/common"
import { ValidateSolanaMetaplexNFTFrozenService } from "./validate-solana-metaplex-nft-frozen.service"
import { ValidateSolanaMetaplexNFTFrozenResolver } from "./validate-solana-metaplex-nft-frozen.resolver"

@Module({
    providers: [
        ValidateSolanaMetaplexNFTFrozenService,
        ValidateSolanaMetaplexNFTFrozenResolver
    ]
})
export class ValidateSolanaMetaplexNFTFrozenModule {}
