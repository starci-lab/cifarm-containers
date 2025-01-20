import { Injectable } from "@nestjs/common"
import { AddParams, AddResult, SubtractParams, SubtractResult } from "./token.types"
import { CheckSufficientParams } from "@src/common"
import { TokenCannotBeZeroOrNegativeException, UserInsufficientTokenException } from "../../exceptions"

@Injectable()
export class TokenBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new UserInsufficientTokenException(current, required)
    }

    public add(request: AddParams): AddResult {
        if (request.amount < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.amount)

        return {
            tokens: request.amount + request.entity.tokens
        }
    }

    public subtract(request: SubtractParams): SubtractResult {
        if (request.amount < 0)
            throw new TokenCannotBeZeroOrNegativeException(request.amount)

        this.checkSufficient({
            current: request.entity.tokens,
            required: request.amount
        })

        return {
            tokens: request.entity.tokens - request.amount
        }
    }
}
