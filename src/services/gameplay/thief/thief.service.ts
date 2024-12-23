import { Injectable } from "@nestjs/common"
import { ComputeParams, ComputeResult } from "./thief.dto"

@Injectable()
export class ThiefService {
    constructor() {}

    public compute(request: ComputeParams): ComputeResult {
        const { thief2, thief3 } = request
        const random = Math.random()
        let value = 1
        if (random > thief2) value = 2
        if (random > thief3) value = 3
        return {
            value
        }
    }
}
