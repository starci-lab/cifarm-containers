import { Injectable } from "@nestjs/common"
import {
    TokenCannotBeZeroOrNegativeException,
    UserInsufficientTokenException
} from "@src/exceptions"
import { AddRequest, AddResponse, SubtractRequest, SubtractResponse } from "./token.dto"
import { CheckSufficientRequest } from "@src/types"

@Injectable()
export class TokenBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientRequest) {
        if (current < required) throw new UserInsufficientTokenException(current, required)
    }

    public add(request: AddRequest): AddResponse {
        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.tokens.toString())

        return {
            tokens: request.tokens + request.entity.tokens
        }
    }

    public subtract(request: SubtractRequest): SubtractResponse {
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
