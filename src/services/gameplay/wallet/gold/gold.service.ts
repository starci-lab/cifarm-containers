import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException, UserInsufficientGoldException } from "@src/exceptions"
import {
    AddRequest,
    AddResponse,
    CheckSufficientRequest,
} from "./gold.dto"

@Injectable()
export class GoldBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientRequest) {
        if (current < required)
            throw new UserInsufficientGoldException(current, required)
    }

    public add(request: AddGoldRequest): AddGoldResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.golds + request.entity.golds
        }
    }

    public subtract(request: SubtractGoldRequest): SubtractGoldResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.entity.golds - request.golds
        }
    }
}
