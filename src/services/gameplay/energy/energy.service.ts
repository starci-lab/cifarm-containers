import { Injectable, Logger } from "@nestjs/common"
import { DataSource } from "typeorm"
import { AddEnergyRequest, AddEnergyResponse, SubstractEnergyRequest, SubstractEnergyResponse } from "./energy.dto"
import { EnergyExceedsMaximumException } from "@src/exceptions"

@Injectable()
export class EnergyService {
    private readonly logger: Logger = new Logger(EnergyService.name)
    constructor(private readonly dataSource: DataSource) {}

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
