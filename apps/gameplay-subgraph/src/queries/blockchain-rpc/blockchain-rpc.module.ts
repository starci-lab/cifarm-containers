import { Module } from "@nestjs/common"
import { BlockchainRpcResolver } from "./blockchain-rpc.resolver"
import { BlockchainRpcService } from "./blockchain-rpc.service"

@Module({
    imports: [],
    providers: [BlockchainRpcService, BlockchainRpcResolver]
})
export class BlockchainRpcModule {}
