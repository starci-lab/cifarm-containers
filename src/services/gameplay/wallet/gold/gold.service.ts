import { Injectable } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException, UserInsufficientGoldException } from "@src/exceptions"
import {
<<<<<<< HEAD
    AddRequest,
    AddResponse,
    SubtractRequest,
    SubtractResponse,
=======
    AddGoldRequest,
    AddGoldResponse,
    CheckSufficientRequest,
    SubtractGoldRequest,
    SubtractGoldResponse
>>>>>>> e68140af2c12491a8f57fc224c94d0cec3d58ff2
} from "./gold.dto"
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

        return {
            golds: request.entity.golds - request.golds
        }
    }
}
