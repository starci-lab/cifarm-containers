import { Injectable } from "@nestjs/common"
import { TokenCannotBeZeroOrNegativeException } from "@src/exceptions"
import {
    AddTokenRequest,
    AddTokenResponse,
    SubtractTokenRequest,
    SubtractTokenResponse
} from "./token.dto"

@Injectable()
export class TokenBalanceService {
    constructor() {}

    public add(request: AddTokenRequest): AddTokenResponse {
        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.tokens.toString())

        return {
            tokens: request.tokens + request.entity.tokens
        }
    }

    public subtract(request: SubtractTokenRequest): SubtractTokenResponse {
        if (request.tokens < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.tokens.toString())

        return {
            tokens: request.entity.tokens - request.tokens
        }
    }
}
