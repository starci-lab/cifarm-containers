import { Module } from "@nestjs/common"
import { TokenModule } from "./token"
import { SpecialModule } from "./special"
import { AuthModule } from "./auth"
import { NftModule } from "./nft"

@Module({
    imports: [AuthModule, SpecialModule, NftModule, TokenModule],
    providers: [],
    exports: [],
})
export class BlockchainModule {}
