import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException } from "@src/exceptions"
import {
    AddGoldRequest,
    AddGoldResponse,
    CheckSufficientRequest,
    CheckSufficientResponse,
    SubtractGoldRequest,
    SubtractGoldResponse
} from "./gold.dto"

@Injectable()
export class GoldBalanceService {
    constructor() {}

    public checkSufficient(request: CheckSufficientRequest): CheckSufficientResponse {
        return {
            isEnough: request.entity.golds >= request.golds
        }
    }

    public addGold(request: AddGoldRequest): AddGoldResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.golds + request.entity.golds
        }
    }

    public subtractGold(request: SubtractGoldRequest): SubtractGoldResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.entity.golds - request.golds
        }
    }
}
