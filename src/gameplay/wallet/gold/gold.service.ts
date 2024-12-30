import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException, UserInsufficientGoldException } from "@src/exceptions"
import { AddParams, AddResult, SubtractParams, SubtractResult } from "./gold.dto"
import { CheckSufficientParams } from "@src/common"

@Injectable()
export class GoldBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new UserInsufficientGoldException(current, required)
    }

    public add(params: AddParams): AddResult {
        if (params.amount < 0) throw new GoldCannotBeZeroOrNegativeException(params.amount.toString())

        return {
            golds: params.amount + params.entity.golds
        }
    }

    public subtract(params: SubtractParams): SubtractResult {
        if (params.amount < 0) throw new GoldCannotBeZeroOrNegativeException(params.amount.toString())

        return {
            golds: params.entity.golds - params.amount
        }
    }
}
