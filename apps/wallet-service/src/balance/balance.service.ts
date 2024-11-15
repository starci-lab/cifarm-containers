import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { DataSource } from "typeorm"
import {
    AddBalanceRequest,
    AddBalanceResponse,
    GetBalanceRequest,
    GetBalanceResponse,
    SubtractBalanceRequest,
    SubtractBalanceResponse
} from "./balance.dto"

@Injectable()
export class BalanceService {
    private readonly logger: Logger = new Logger(BalanceService.name)
    constructor(private readonly dataSource: DataSource) {}

    public async getBalance(request: GetBalanceRequest): Promise<GetBalanceResponse> {
        const user = await this.findUserById(request.userId)
        return {
            golds: user.golds,
            tokens: user.tokens
        }
    }

    public async addBalance(request: AddBalanceRequest): Promise<AddBalanceResponse> {
        const user = await this.findUserById(request.userId)

        if (!user) throw new GrpcNotFoundException("User not found")
        user.golds += Number(request.golds)
        user.tokens += Number(request.tokens)

        await this.dataSource.manager.save(user)
        return
    }

    public async subtractBalance(
        request: SubtractBalanceRequest
    ): Promise<SubtractBalanceResponse> {
        const user = await this.findUserById(request.userId)
        if (!user) throw new GrpcNotFoundException("User not found")

        if (typeof user.tokens !== "number" || isNaN(user.tokens)) {
            throw new GrpcInvalidArgumentException("User token balance is invalid")
        }

        if (user.golds < Number(request.golds))
            throw new GrpcInvalidArgumentException("Insufficient gold balance")
        if (user.tokens < Number(request.tokens))
            throw new GrpcInvalidArgumentException("Insufficient token balance")

        user.golds -= Number(request.golds)
        user.tokens -= Number(request.tokens)

        await this.dataSource.manager.save(user)
        return
    }

    private async findUserById(userId: string): Promise<UserEntity> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: userId }
        })
        if (!user) throw new GrpcNotFoundException("User not found")
        return user
    }
}
