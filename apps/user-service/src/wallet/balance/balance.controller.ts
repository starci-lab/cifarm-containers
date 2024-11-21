import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { userGrpcConstants } from "../../constants"
import { GetBalanceRequest, GetBalanceResponse } from "./balance.dto"
import { BalanceService } from "./balance.service"

@Controller()
export class BalanceController {
    private readonly logger = new Logger(BalanceController.name)

    constructor(private readonly balanceService: BalanceService) {}

    @GrpcMethod(userGrpcConstants.SERVICE, "GetBalance")
    async getBalance(request: GetBalanceRequest): Promise<GetBalanceResponse> {
        this.logger.debug(`Received GetBalance request for user: ${request.userId}`)

        return this.balanceService.getBalance(request)
    }
}
