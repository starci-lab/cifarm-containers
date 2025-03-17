import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException, UserInsufficientGoldException } from "../../exceptions"
import { AddParams, AddResult, SubtractParams, SubtractResult } from "./gold.types"
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
        if (user.golds < amount) throw new UserInsufficientGoldException(user.golds, amount)
        user.golds -= amount
        return user
    }
}
