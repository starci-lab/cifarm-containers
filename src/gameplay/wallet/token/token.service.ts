import { Injectable } from "@nestjs/common"
import {
    TokenCannotBeZeroOrNegativeException,
    UserInsufficientTokenException
} from "@src/exceptions"
import { AddParams, AddResult, SubtractParams, SubtractResult } from "./token.dto"
import { CheckSufficientParams } from "@src/common"

@Injectable()
export class TokenBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new UserInsufficientTokenException(current, required)
    }

    public add(request: AddParams): AddResult {
        if (request.amount < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.amount.toString())

        return {
            tokens: request.amount + request.entity.tokens
        }
    }

    public subtract(request: SubtractParams): SubtractResult {
        if (request.amount < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.amount.toString())

        this.checkSufficient({
            current: request.entity.tokens,
            required: request.amount
        })

        return {
            tokens: request.entity.tokens - request.amount
        }
    }
}
