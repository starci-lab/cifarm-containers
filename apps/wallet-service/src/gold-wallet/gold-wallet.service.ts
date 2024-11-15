import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import {
    GrpcAbortedException,
    GrpcInvalidArgumentException,
    GrpcNotFoundException
} from "nestjs-grpc-exceptions"
import { DataSource } from "typeorm"
import {
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    GoldRequest,
    GoldResponse
} from "./gold-wallet.dto"

@Injectable()
export class GoldWalletService {
    private readonly logger: Logger = new Logger(GoldWalletService.name)
    constructor(private readonly dataSource: DataSource) {}

    /**
     * Gets the gold balance for a user.
     * @param request The GetGoldBalanceRequest DTO
     * @returns The user's gold balance wrapped in GetGoldBalanceResponse
     */
    public async getGoldBalance(request: GetGoldBalanceRequest): Promise<GetGoldBalanceResponse> {
        const user = await this.findUserById(request.userId)
        return { golds: user.golds }
    }

    /**
     * Adds gold to a user's account.
     * @param request The GoldRequest DTO
     * @returns A success message wrapped in GoldResponse
     */
    public async addGold(request: GoldRequest): Promise<GoldResponse> {
        if (request.goldAmount < 0)
            throw new GrpcInvalidArgumentException("Gold amount must be positive")
        const user = await this.findUserById(request.userId)
        if (!user) throw new GrpcNotFoundException("User not found")
        user.golds += request.goldAmount
        await this.dataSource.manager.save(user)
        return { message: "Gold added successfully" }
    }

    /**
     * Subtracts gold from a user's account.
     * @param request The GoldRequest DTO
     * @returns A success message wrapped in GoldResponse
     */
    public async subtractGold(request: GoldRequest): Promise<GoldResponse> {
        if (request.goldAmount < 0)
            throw new GrpcInvalidArgumentException("Gold amount must be positive")
        const user = await this.findUserById(request.userId)
        if (!user) throw new GrpcNotFoundException("User not found")
        if (user.golds < request.goldAmount)
            throw new GrpcAbortedException("Insufficient gold balance")
        user.golds -= request.goldAmount
        await this.dataSource.manager.save(user)
        return { message: "Gold subtracted successfully" }
    }

    /**
     * Helper method to find a user by their ID.
     * @param userId The ID of the user
     * @returns The UserEntity object
     */
    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: userId },
            select: ["golds"]
        })
        if (!user) throw new GrpcNotFoundException("User not found")
        return user
    }
}
