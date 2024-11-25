import { Injectable } from "@nestjs/common"
import {
    TokenCannotBeZeroOrNegativeException,
    UserInsufficientTokenException
} from "@src/exceptions"
import { AddParams, AddResult, SubtractParams, SubtractResult } from "./token.dto"
import { CheckSufficientParams } from "@src/types"

@Injectable()
export class TokenBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new UserInsufficientTokenException(current, required)
    }

    public add(request: AddParams): AddResult {
        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.tokens.toString())

        return {
            tokens: request.tokens + request.entity.tokens
        }
    }

    public subtract(request: SubtractParams): SubtractResult {
        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.tokens.toString())

        this.checkSufficient({
            current: request.entity.tokens,
            required: request.tokens
        })

        return {
            tokens: request.entity.tokens - request.tokens
        }
    }
}
