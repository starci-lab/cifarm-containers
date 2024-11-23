import { Injectable, Logger } from "@nestjs/common"
import { BalanceService } from "../balance"
import {
    AddGoldRequest,
    AddGoldResponse,
    GetGoldBalanceRequest,
    GetGoldBalanceResponse,
    SubtractGoldRequest,
    SubtractGoldResponse
} from "./gold.dto"
import { GrpcInvalidArgumentException } from "nestjs-grpc-exceptions"

@Injectable()
export class GoldBalanceService {
    private readonly logger: Logger = new Logger(GoldBalanceService.name)
    constructor(private readonly balanceService: BalanceService) {}

    public async getGoldBalance(request: GetGoldBalanceRequest): Promise<GetGoldBalanceResponse> {
        const { golds } = await this.balanceService.getBalance(request)
        return { golds }
    }

    public addGold(request: AddGoldRequest): AddGoldResponse {
        if (typeof request.golds !== "number" || isNaN(request.golds)) {
            throw new GrpcInvalidArgumentException("Invalid token amount")
        }
        if (request.golds < 0)
            throw new GrpcInvalidArgumentException("Gold amount must be positive")

        return {
            golds: request.golds + request.entity.golds
        }
    }

    public async subtractGold(request: SubtractGoldRequest): Promise<SubtractGoldResponse> {
        if (typeof request.golds !== "number" || isNaN(request.golds)) {
            throw new GrpcInvalidArgumentException("Invalid token amount")
        }
        if (request.golds < 0)
            throw new GrpcInvalidArgumentException("Gold amount must be positive")

        return this.balanceService.subtractBalance({
            userId: request.userId,
            golds: request.golds,
            tokens: 0
        })
    }
}
