import { Injectable } from "@nestjs/common"
import { EnergyExceedsMaximumException } from "@src/exceptions"
import {
    AddEnergyRequest,
    AddEnergyResponse,
    SubstractEnergyRequest,
    SubstractEnergyResponse
} from "./energy.dto"

@Injectable()
export class EnergyService {
    constructor() {}

    public addEnergy(request: AddEnergyRequest): AddEnergyResponse {
        const { energy, entity } = request
        const maxEnergy = this.getMaxEnergy(entity.level)
        if (request.entity.energy + request.energy > maxEnergy)
            throw new EnergyExceedsMaximumException(entity.energy + energy, maxEnergy)
        return {
            energy: entity.energy + energy
        }
    }

    public substractEnergy(request: SubstractEnergyRequest): SubstractEnergyResponse {
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
}
