import { Injectable } from "@nestjs/common"
import { AddParams, AddResult, SubstractParams, SubstractResult } from "./energy.types"
import { CheckSufficientParams } from "@src/common"
import { EnergyNotEnoughException } from "../exceptions"

@Injectable()
export class EnergyService {
    constructor() {}

    public add(request: AddParams): AddResult {
        const { energy, entity } = request
        const maxEnergy = this.getMaxEnergy(entity.level)
        const energyFull = entity.energy + energy >= maxEnergy
        return {
            energy: Math.min(maxEnergy, entity.energy + energy),
            energyFull
        }
    }

    public substract(request: SubstractParams): SubstractResult {
        const { energy, entity } = request
        this.checkSufficient({ current: entity.energy, required: energy })
        return {
            energy: entity.energy - energy,
            energyFull: false
        }
    }

    public getMaxEnergy(level: number = 1): number {
        return 50 + (level - 1) * 3
    }

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required) throw new EnergyNotEnoughException(current, required)
    }
}
