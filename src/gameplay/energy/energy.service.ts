import { Injectable } from "@nestjs/common"
import { AddParams, AddResult, SubtractParams, SubstractResult } from "./energy.types"
import { CheckSufficientParams } from "@src/common"
import { EnergyNotEnoughException } from "../exceptions"

@Injectable()
export class EnergyService {
    constructor() {}

    public add({ user, quantity }: AddParams): AddResult {
        const maxEnergy = this.getMaxEnergy(user.level)
        const energyFull = user.energy + quantity >= maxEnergy
        user.energy = energyFull ? maxEnergy : user.energy + quantity
        user.energyFull = energyFull
        return user
    }

    public subtract({ user, quantity }: SubtractParams): SubstractResult {
        this.checkSufficient({ current: user.energy, required: quantity })
        user.energy -= quantity
        user.energyFull = false
        return user
    }

    public getMaxEnergy(level: number = 1): number {
        return 50 + (level - 1) * 3
    }

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new EnergyNotEnoughException(current, required)
    }
}
