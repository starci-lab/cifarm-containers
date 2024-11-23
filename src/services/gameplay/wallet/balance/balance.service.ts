import { Injectable, Logger } from "@nestjs/common"
import {
    GoldCannotBeZeroOrNegativeException,
    TokenCannotBeZeroOrNegativeException
} from "@src/exceptions"
import {
    AddBalanceRequest,
    AddBalanceResponse,
    SubtractBalanceRequest,
    SubtractBalanceResponse
} from "./balance.dto"

@Injectable()
export class BalanceService {
    private readonly logger: Logger = new Logger(BalanceService.name)
    constructor() {}

    public addBalance(request: AddBalanceRequest): AddBalanceResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.golds + request.entity.golds,
            tokens: request.tokens + request.entity.tokens
        }
    }

    public subtractBalance(request: SubtractBalanceRequest): SubtractBalanceResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.entity.golds - request.golds,
            tokens: request.entity.tokens - request.tokens
        }
    }
}
