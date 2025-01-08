import { Module } from "@nestjs/common"
import { BlockchainTokenService } from "./blockchain-token.service"

@Module({
    providers: [
        BlockchainTokenService
    ],
    exports: [
        BlockchainTokenService
    ],
})
export class TokenModule {}
