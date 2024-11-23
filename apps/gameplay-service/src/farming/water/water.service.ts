import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { Inject, Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    PlacedItemEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { Cache } from "cache-manager"
import { DataSource } from "typeorm"
import { WaterRequest, WaterResponse } from "./water.dto"
import {
    EnergyNotEnoughException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotNeedWaterException,
    PlacedItemTileNotPlantedException
} from "@src/exceptions"
import { EnergyService, LevelService } from "@src/services"

@Injectable()
export class WaterService {
    private readonly logger = new Logger(WaterService.name)
    constructor(
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async water(request: WaterRequest): Promise<WaterResponse> {
        const placedItemTile = await this.dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: request.id },
            relations: {
                seedGrowthInfo: true
            }
        })

        if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.id)

        if (placedItemTile.seedGrowthInfo.isPlanted)
            throw new PlacedItemTileNotPlantedException(request.id)

        if (placedItemTile.seedGrowthInfo.currentStage !== CropCurrentState.NeedWater)
            throw new PlacedItemTileNotNeedWaterException(request.id)

        const { value } = await this.dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            water: { energyCost, experiencesGain }
        } = value as Activities

        const user = await this.dataSource.manager.findOne(UserEntity, {
            where: { id: request.userId }
        })

        if (user.energy < energyCost) throw new EnergyNotEnoughException(user.energy, energyCost)

        // substract energy
        const subtractEnergyChanges = this.energyService.substractEnergy({
            entity: user,
            energy: energyCost
        })
        const addExperiencesChanges = this.levelService.addExperiences({
            entity: user,
            experiences: experiencesGain
        })

        // update user
        await this.dataSource.manager.update(UserEntity, user.id, {
            ...subtractEnergyChanges,
            ...addExperiencesChanges
        })
    }
}
