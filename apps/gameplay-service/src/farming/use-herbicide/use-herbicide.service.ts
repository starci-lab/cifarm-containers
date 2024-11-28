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
import { UseHerbicideRequest, UseHerbicideResponse } from "./use-herbicide.dto"
import {
    PlacedItemNotNeedUseHerbicideException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotPlantedException,
    UseHerbicideTransactionFailedException
} from "@src/exceptions"
import { EnergyService, LevelService } from "@src/services"

@Injectable()
export class UseHerbicideService {
    private readonly logger = new Logger(UseHerbicideService.name)
    constructor(
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {}

    async useHerbicide(request: UseHerbicideRequest): Promise<UseHerbicideResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemTileId },
                relations: {
                    seedGrowthInfo: true
                }
            })

            if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.placedItemTileId)

            if (!placedItemTile.seedGrowthInfo)
                throw new PlacedItemTileNotPlantedException(request.placedItemTileId)

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.IsWeedy)
                throw new PlacedItemNotNeedUseHerbicideException(request.placedItemTileId)

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                usePestiside: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            await queryRunner.startTransaction()
            // substract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })
            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })

            // update user
            await queryRunner.manager.update(UserEntity, user.id, {
                ...energyChanges,
                ...experiencesChanges
            })

            // update seed growth info
            await queryRunner.manager.update(
                SeedGrowthInfoEntity,
                placedItemTile.seedGrowthInfo.id,
                {
                    ...placedItemTile.seedGrowthInfo,
                    currentState: CropCurrentState.Normal
                }
            )
            return {}
        } catch (error) {
            this.logger.error("Use pestiside transaction failed, rolling back...", error)
            await queryRunner.rollbackTransaction()
            throw new UseHerbicideTransactionFailedException(error)
        } finally {
            await queryRunner.release()
        }
    }
}