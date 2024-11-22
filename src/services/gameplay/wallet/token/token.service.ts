import { Injectable, Logger } from "@nestjs/common"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"
import { BalanceService } from "../balance"
import {
    AddTokenRequest,
    AddTokenResponse,
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    SubtractTokenRequest,
    SubtractTokenResponse
} from "./token.dto"

@Injectable()
export class TokenService {
    private readonly logger: Logger = new Logger(TokenService.name)

    constructor(private readonly balanceService: BalanceService) {}

    /**
     * Gets the token balance for a user.
     * @param request The GetTokenBalanceRequest DTO
     * @returns The user's token balance wrapped in GetTokenBalanceResponse
     */
    public async getTokenBalance(
        request: GetTokenBalanceRequest
    ): Promise<GetTokenBalanceResponse> {
        const { tokens } = await this.balanceService.getBalance(request)
        return { tokens }
    }

    /**
     * Adds tokens to a user's account.
     * @param request The AddTokenRequest DTO
     * @returns A success message wrapped in AddTokenResponse
     */
    public async addToken(request: AddTokenRequest): Promise<AddTokenResponse> {
        if (typeof request.tokens !== "number" || isNaN(request.tokens)) {
            throw new GrpcInvalidArgumentException("Invalid token amount")
        }
        if (request.tokens < 0) {
            throw new GrpcInvalidArgumentException("Token amount must be positive")
        }

        return this.balanceService.addBalance({
            userId: request.userId,
            golds: 0,
            tokens: request.tokens
        })
    }

    /**
     * Subtracts tokens from a user's account.
     * @param request The SubtractTokenRequest DTO
     * @returns A success message wrapped in SubtractTokenResponse
     */
    public async subtractToken(request: SubtractTokenRequest): Promise<SubtractTokenResponse> {
        if (typeof request.tokens !== "number" || isNaN(request.tokens)) {
            throw new GrpcInvalidArgumentException("Invalid token amount")
        }
        if (request.tokens < 0) {
            throw new GrpcInvalidArgumentException("Token amount must be positive")
        }

        return this.balanceService.subtractBalance({
            userId: request.userId,
            golds: 0,
            tokens: request.tokens
        })
    }
}
