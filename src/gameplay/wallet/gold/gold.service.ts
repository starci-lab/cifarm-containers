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

        return {
            golds: amount + user.golds
        }
    }

    public subtract({ amount, user }: SubtractParams): SubtractResult {
        if (amount < 0) throw new GoldCannotBeZeroOrNegativeException(amount)

        return {
            golds: user.golds - amount
        }
    }
}
