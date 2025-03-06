import { Module } from "@nestjs/common"
import { MintOffchainTokensService } from "./mint-offchain-tokens.service"
import { MintOffchainTokensController } from "./mint-offchain-tokens.controller"


@Module({
    imports: [],
    providers: [MintOffchainTokensService],
    controllers: [MintOffchainTokensController]
})
export class MintOffchainTokensModule {}
