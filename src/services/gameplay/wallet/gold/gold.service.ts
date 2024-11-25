import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException, UserInsufficientGoldException } from "@src/exceptions"
import { AddRequest, AddResponse, SubtractRequest, SubtractResponse } from "./gold.dto"
import { CheckSufficientRequest } from "@src/types"

@Injectable()
export class GoldBalanceService {
    constructor() {}

    public checkSufficient({ current, required }: CheckSufficientRequest) {
        if (current < required) throw new UserInsufficientGoldException(current, required)
    }

    public add(request: AddRequest): AddResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        return {
            golds: request.golds + request.entity.golds
        }
    }

    public subtract(request: SubtractRequest): SubtractResponse {
        if (request.golds < 0)
            throw new GoldCannotBeZeroOrNegativeException(request.golds.toString())

        this.checkSufficient({
            current: request.entity.golds,
            required: request.golds
        })

        return {
            golds: request.entity.golds - request.golds
        }
    }
}
