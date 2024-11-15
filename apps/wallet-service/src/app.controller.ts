import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { BalanceService, GetBalanceRequest, GetBalanceResponse } from "./balance"
import { walletGrpcConstants } from "./constants"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(private readonly balanceService: BalanceService) {}
    @GrpcMethod(walletGrpcConstants.SERVICE, "GetBalance")
    async getBalance(request: GetBalanceRequest): Promise<GetBalanceResponse> {
        this.logger.debug(`Received GetBalance request for user: ${request.userId}`)

        return this.balanceService.getBalance(request)
    }
}
