import { Module } from "@nestjs/common"
import { BlockchainResolver } from "./blockchain.resolver"
import { BlockchainService } from "./blockchain.service"

@Module({
    imports: [],
    providers: [BlockchainService, BlockchainResolver]
})
export class BlockchainModule {}
