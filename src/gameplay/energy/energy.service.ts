import { Injectable } from "@nestjs/common"
import { AddParams, AddResult, SubstractParams, SubstractResult } from "./energy.types"
import { CheckSufficientParams } from "@src/common"
import { EnergyNotEnoughException } from "../exceptions"

@Injectable()
export class EnergyService {
    constructor() {}

    public add({ user, quantity }: AddParams): AddResult {
        const maxEnergy = this.getMaxEnergy(user.level)
        const energyFull = user.energy + quantity >= maxEnergy
        return {
            energy: energyFull ? maxEnergy : user.energy + quantity,
            energyFull
        }
    }

    public substract(request: SubstractParams): SubstractResult {
        this.checkSufficient({ current: request.user.energy, required: request.quantity })
        return { energy: request.user.energy - request.quantity }
    }

    public getMaxEnergy(level: number = 1): number {
        return 50 + (level - 1) * 3
    }

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new EnergyNotEnoughException(current, required)
    }
}
