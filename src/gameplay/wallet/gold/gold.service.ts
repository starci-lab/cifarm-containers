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

    public add(params: AddParams): AddResult {
        if (params.amount < 0) throw new GoldCannotBeZeroOrNegativeException(params.amount)

        return {
            golds: params.amount + params.entity.golds
        }
    }

    public subtract(params: SubtractParams): SubtractResult {
        if (params.amount < 0) throw new GoldCannotBeZeroOrNegativeException(params.amount)

        return {
            golds: params.entity.golds - params.amount
        }
    }
}
