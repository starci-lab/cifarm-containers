import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException, UserInsufficientGoldException } from "../../exceptions"
import { AddParams, AddResult, SubtractParams, SubtractResult } from "./types"
import { CheckSufficientParams } from "@src/common"

@Injectable()
export class GoldBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new UserInsufficientGoldException(current, required)
    }

    public add({ amount, user }: AddParams): AddResult {
        if (amount < 0) throw new GoldCannotBeZeroOrNegativeException(amount)
        user.golds += amount
        return user
    }

    public subtract({ amount, user }: SubtractParams): SubtractResult {
        if (amount < 0) throw new GoldCannotBeZeroOrNegativeException(amount)

        this.checkSufficient({
            current: user.golds,
            required: amount
        })

        user.golds -= amount
        return user
    }
}
