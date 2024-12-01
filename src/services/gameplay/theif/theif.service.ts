import { Injectable } from "@nestjs/common"
import { ComputeParams, ComputeResult } from "./theif.dto"

@Injectable()
export class TheifService {
    constructor() {}

    public compute(request: ComputeParams): ComputeResult {
        const { theif2, theif3 } = request
        const random = Math.random()
        let value = 1
        if (random > theif2) value = 2
        if (random > theif3) value = 3
        return {
            value
        }
    }
}
