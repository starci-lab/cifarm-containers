import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { DataSource } from "typeorm"
import { WaterRequest, WaterResponse } from "./water.dto"
import {
    EnergyNotEnoughException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotNeedWaterException,
    PlacedItemTileNotPlantedException,
    WaterTransactionFailedException
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
        const energyChanges = this.energyService.substract({
            entity: user,
            energy: energyCost
        })
        const experiencesChanges = this.levelService.addExperiences({
            entity: user,
            experiences: experiencesGain
        })

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()
        try {
            // update user
            await queryRunner.manager.update(UserEntity, user.id, {
                ...energyChanges,
                ...experiencesChanges
            })
            // update seed growth info
            await queryRunner.manager.update(SeedGrowthInfoEntity, placedItemTile.seedGrowthInfo.id, {
                ...placedItemTile.seedGrowthInfo,
                currentStage: CropCurrentState.Normal
            })
            return {}
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw new WaterTransactionFailedException(error)
        } finally {
            await queryRunner.release()
        }
    }
}
