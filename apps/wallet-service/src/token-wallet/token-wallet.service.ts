import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import {
    GrpcAbortedException,
    GrpcInvalidArgumentException,
    GrpcNotFoundException
} from "nestjs-grpc-exceptions"
import { DataSource } from "typeorm"
import {
    GetTokenBalanceRequest,
    GetTokenBalanceResponse,
    TokenRequest,
    TokenResponse
} from "./token-wallet.dto"

@Injectable()
export class TokenWalletService {
    private readonly logger: Logger = new Logger(TokenWalletService.name)

    constructor(private readonly dataSource: DataSource) {}

    /**
     * Gets the token balance for a user.
     * @param request The GetTokenBalanceRequest DTO
     * @returns The user's token balance wrapped in GetTokenBalanceResponse
     */
    public async getTokenBalance(
        request: GetTokenBalanceRequest
    ): Promise<GetTokenBalanceResponse> {
        const user: UserEntity = await this.findUserById(request.userId)
        return { tokens: user.tokens }
    }

    /**
     * Adds tokens to a user's account.
     * @param request The TokenRequest DTO
     * @returns A success message wrapped in TokenResponse
     */
    public async addToken(request: TokenRequest): Promise<TokenResponse> {
        if (request.tokenAmount < 0)
            throw new GrpcInvalidArgumentException("Token amount must be positive")
        const user: UserEntity = await this.findUserById(request.userId)
        if (!user) throw new GrpcNotFoundException("User not found")
        user.tokens += request.tokenAmount
        await this.dataSource.manager.save(user)
        return { message: "Token added successfully" }
    }

    /**
     * Subtracts tokens from a user's account.
     * @param request The TokenRequest DTO
     * @returns A success message wrapped in TokenResponse
     */
    public async subtractToken(request: TokenRequest): Promise<TokenResponse> {
        if (request.tokenAmount < 0)
            throw new GrpcInvalidArgumentException("Token amount must be positive")
        const user: UserEntity = await this.findUserById(request.userId)
        if (!user) throw new GrpcNotFoundException("User not found")
        if (user.tokens < request.tokenAmount)
            throw new GrpcAbortedException("Insufficient token balance")
        user.tokens -= request.tokenAmount
        await this.dataSource.manager.save(user)
        return { message: "Token subtracted successfully" }
    }

    /**
     * Helper method to find a user by their ID.
     * @param userId The ID of the user
     * @returns The UserEntity object
     */
    private async findUserById(userId: string): Promise<UserEntity> {
        const user: UserEntity = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: userId },
            select: ["tokens"]
        })
        if (!user) throw new GrpcNotFoundException("User not found")
        return user
    }
}
