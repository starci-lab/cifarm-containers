import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { getGrpcData, GrpcName } from "@src/grpc"
import { MintOffchainTokensRequest } from "./mint-offchain-tokens.dto"
import { MintOffchainTokensService } from "./mint-offchain-tokens.service"

@Controller()
export class MintOffchainTokensController {
    private readonly logger = new Logger(MintOffchainTokensController.name)

    constructor(
        private readonly mintOffchainTokensService: MintOffchainTokensService
    ) {}

    @GrpcMethod(getGrpcData(GrpcName.Gameplay).data.service, "MintOffchainTokens")
    public async mintOffchainTokens(request: MintOffchainTokensRequest) {
        return this.mintOffchainTokensService.mintOffchainTokensService(request)
    }
}
