import { Module } from "@nestjs/common"
import { TokenModule } from "./token"
import { SpecialModule } from "./special"
import { AuthModule } from "./auth"
import { NftModule } from "./nft"
import { EnvModule } from "@src/env"

@Module({
    imports: [
        EnvModule.forRoot(),
        AuthModule,
        SpecialModule,
        NftModule,
        TokenModule],
    providers: [],
    exports: [],
})
export class BlockchainModule {}
