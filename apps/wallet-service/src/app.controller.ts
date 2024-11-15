import { Controller, Logger } from "@nestjs/common"
import { GrpcMethod } from "@nestjs/microservices"
import { walletGrpcConstants } from "./constants"
import { GoldWalletService } from "./gold-wallet"
import { TokenWalletService } from "./token-wallet" // Import TokenWalletService
import {
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    GoldRequest,
    GoldResponse
} from "./gold-wallet"
import {
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    TokenRequest,
    TokenResponse
} from "./token-wallet"

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name)

    constructor(
        private readonly goldWalletService: GoldWalletService,
        private readonly tokenWalletService: TokenWalletService
    ) {}

    @GrpcMethod(walletGrpcConstants.SERVICE, "GetGoldBalance")
    async getGoldBalance(request: GetGoldBalanceRequest): Promise<GetGoldBalanceResponse> {
        this.logger.debug(`Received GetGoldBalance request for user: ${request.userId}`)
        return this.goldWalletService.getGoldBalance(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "AddGold")
    async addGold(request: GoldRequest): Promise<GoldResponse> {
        this.logger.debug(
            `Received AddGold request for user: ${request.userId} with amount: ${request.goldAmount}`
        )
        return this.goldWalletService.addGold(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "SubtractGold")
    async subtractGold(request: GoldRequest): Promise<GoldResponse> {
        this.logger.debug(
            `Received SubtractGold request for user: ${request.userId} with amount: ${request.goldAmount}`
        )
        return this.goldWalletService.subtractGold(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "GetTokenBalance")
    async getTokenBalance(request: GetTokenBalanceRequest): Promise<GetTokenBalanceResponse> {
        this.logger.debug(`Received GetTokenBalance request for user: ${request.userId}`)
        return this.tokenWalletService.getTokenBalance(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "AddToken")
    async addToken(request: TokenRequest): Promise<TokenResponse> {
        this.logger.debug(
            `Received AddToken request for user: ${request.userId} with amount: ${request.tokenAmount}`
        )
        return this.tokenWalletService.addToken(request)
    }

    @GrpcMethod(walletGrpcConstants.SERVICE, "SubtractToken")
    async subtractToken(request: TokenRequest): Promise<TokenResponse> {
        this.logger.debug(
            `Received SubtractToken request for user: ${request.userId} with amount: ${request.tokenAmount}`
        )
        return this.tokenWalletService.subtractToken(request)
    }

    // Combined GetBalance Method for Gold and Token
    @GrpcMethod(walletGrpcConstants.SERVICE, "GetBalance")
    async getBalance(request: GetGoldBalanceRequest): Promise<{ golds: number; tokens: number }> {
        this.logger.debug(`Received GetBalance request for user: ${request.userId}`)

        // Fetch both gold and token balances
        const goldBalance = await this.goldWalletService.getGoldBalance(request)
        const tokenBalance = await this.tokenWalletService.getTokenBalance(request)

        return {
            golds: goldBalance.golds,
            tokens: tokenBalance.tokens
        }
    }
}
