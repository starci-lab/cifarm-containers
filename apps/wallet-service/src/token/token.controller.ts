import { Controller, Logger } from "@nestjs/common"
import { TokenService } from "./token.service"
import { GrpcMethod } from "@nestjs/microservices"
import { walletGrpcConstants } from "../constants"
import {
    AddTokenRequest,
    AddTokenResponse,
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    SubtractTokenRequest,
    SubtractTokenResponse
} from "./token.dto"

@Controller()
export class TokenController {
    private readonly logger = new Logger(TokenController.name)

    constructor(private readonly tokenService: TokenService) {}

    @GrpcMethod(walletGrpcConstants.SERVICE, "GetTokenBalance")
    async getTokenBalance(request: GetTokenBalanceRequest): Promise<GetTokenBalanceResponse> {
        this.logger.debug(`Received getTokenBalance request for user: ${request.userId}`)
        return this.tokenService.getTokenBalance(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "AddToken")
    async addToken(request: AddTokenRequest): Promise<AddTokenResponse> {
        this.logger.debug(
            `Received addToken request for user: ${request.userId} with amount: ${request.tokens}`
        )
        return this.tokenService.addToken(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "SubtractToken")
    async subtractToken(request: SubtractTokenRequest): Promise<SubtractTokenResponse> {
        this.logger.debug(
            `Received subtractToken request for user: ${request.userId} with amount: ${request.tokens}`
        )
        return this.tokenService.subtractToken(request)
    }
}
