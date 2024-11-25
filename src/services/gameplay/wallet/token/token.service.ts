import { Injectable } from "@nestjs/common"
import { TokenCannotBeZeroOrNegativeException } from "@src/exceptions"
import { AddRequest, AddResponse, SubtractRequest, SubtractResponse } from "./token.dto"

@Injectable()
export class TokenBalanceService {
    constructor() {}

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

        return {
            tokens: request.entity.tokens - request.tokens
        }
    }
}
