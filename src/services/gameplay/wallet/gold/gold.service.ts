import { Injectable, Logger } from "@nestjs/common"
import { GoldCannotBeZeroOrNegativeException } from "@src/exceptions"
import {
    AddGoldRequest,
    AddGoldResponse,
    SubtractGoldRequest,
    SubtractGoldResponse
} from "./gold.dto"

@Injectable()
export class GoldBalanceService {
    constructor() {}

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
