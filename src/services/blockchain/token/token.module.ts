import { Global, Module } from "@nestjs/common"
import { BlockchainTokenService } from "./blockchain-token.service"

@Global()
@Module({
    imports: [],
    providers: [
        BlockchainTokenService
    ],
    exports: [
        BlockchainTokenService
    ],
})
export class TokenModule {}
