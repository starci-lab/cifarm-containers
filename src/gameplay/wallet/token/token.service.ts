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

    public add({ amount, user }: AddParams): AddResult {
        if (amount < 0)
            throw new TokenCannotBeZeroOrNegativeException(amount)

        return {
            tokens: amount + user.tokens
        }
    }

    public subtract({ amount, user }: SubtractParams): SubtractResult {
        if (amount < 0)
            throw new TokenCannotBeZeroOrNegativeException(amount)

        this.checkSufficient({
            current: user.tokens,
            required: amount
        })

        return {
            tokens: user.tokens - amount
        }
    }
}
