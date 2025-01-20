import { Inject, Injectable } from "@nestjs/common"
import { ComputeParams, ComputeResult } from "./thief.types"
import { MODULE_OPTIONS_TOKEN } from "../gameplay.module-definition"
import { GameplayOptions } from "../gameplay.types"

@Injectable()
export class ThiefService {
    public readonly minQuantity: number
    public readonly maxQuantity: number
    public readonly avgQuantity: number

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN)
        private readonly options: GameplayOptions
    ) {
        this.minQuantity = this.options.theif?.minQuantity || 1
        this.maxQuantity = this.options.theif?.maxQuantity || 3
        this.avgQuantity = Math.floor((this.minQuantity + this.maxQuantity) / 2)
    }

    public compute(request: ComputeParams): ComputeResult {
        const { thief2, thief3 } = request
        const random = Math.random()
        let value = this.minQuantity
        if (random > thief2) value = this.avgQuantity
        if (random > thief3) value = this.maxQuantity
        return {
            value
        }
    }
}
