import { Injectable, Logger } from "@nestjs/common"
import { UserEntity } from "@src/database"
import { DataSource } from "typeorm"
import { AddEnergyRequest, AddEnergyResponse, SubstractEnergyRequest, SubstractEnergyResponse } from "./energy.dto"
import { EnergyExceedsMaximumException, UserNotFoundException } from "@src/exceptions"

@Injectable()
export class EnergyService {
    private readonly logger: Logger = new Logger(EnergyService.name)
    constructor(private readonly dataSource: DataSource) {}

    public async addEnergy(request: AddEnergyRequest): Promise<AddEnergyResponse> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: request.userId }
        })
        if (!user) throw new UserNotFoundException(request.userId)
        const maxEnergy = this.getMaxEnergy(user.level)

        if (user.energy + request.energy > maxEnergy)
            throw new EnergyExceedsMaximumException(user.energy + request.energy, maxEnergy)

        await this.dataSource.manager.increment(
            UserEntity,
            { id: user.id },
            "energy",
            request.energy
        )
        return {}
    }

    public async substractEnergy(request: SubstractEnergyRequest): Promise<SubstractEnergyResponse> {
        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: request.userId }
        })
        if (!user) throw new UserNotFoundException(request.userId)

        if (user.energy - request.energy < 0)
            throw new EnergyExceedsMaximumException(user.energy - request.energy, 0)

        await this.dataSource.manager.decrement(
            UserEntity,
            { id: user.id },
            "energy",
            request.energy
        )
        return {}
    }
    
    private getMaxEnergy(level: number): number {
        return 50 + (level - 1) * 3
    }
}
