import { Injectable } from "@nestjs/common"
import { EnergyExceedsMaximumException, EnergyNotEnoughException } from "@src/exceptions"
import {
    AddParams,
    AddResult,
    SubstractParams,
    SubstractResult,
} from "./energy.dto"
import { CheckSufficientParams } from "@src/types"

@Injectable()
export class EnergyService {
    constructor() {}

    public add(request: AddParams): AddResult {
        const { energy, entity } = request
        const maxEnergy = this.getMaxEnergy(entity.level)
        if (request.entity.energy + request.energy > maxEnergy)
            throw new EnergyExceedsMaximumException(entity.energy + energy, maxEnergy)
        return {
            energy: entity.energy + energy
        }
    }

    public substract(request: SubstractParams): SubstractResult {
        const { energy, entity } = request
        if (entity.energy - energy < 0)
            throw new EnergyExceedsMaximumException(entity.energy - request.energy, 0)
        return {
            energy: entity.energy - energy
        }
    }

    private getMaxEnergy(level: number): number {
        return 50 + (level - 1) * 3
    }

    public checkSufficient({ current, required }: CheckSufficientParams) {
        if (current < required)
            throw new EnergyNotEnoughException(current, required)
    }
}
