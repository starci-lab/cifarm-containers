import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    GameplayPostgreSQLService,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { DataSource } from "typeorm"
import { WaterRequest, WaterResponse } from "./water.dto"
import {
    PlacedItemTileNotFoundException,
    PlacedItemTileNotNeedWaterException,
    PlacedItemTileNotPlantedException,
    WaterTransactionFailedException
} from "@src/exceptions"
import { EnergyService, LevelService } from "@src/gameplay"

@Injectable()
export class WaterService {
    private readonly logger = new Logger(WaterService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

    async water(request: WaterRequest): Promise<WaterResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { 
                    userId: request.userId,
                    id: request.placedItemTileId 
                },
                relations: {
                    seedGrowthInfo: true
                }
            })

            if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.placedItemTileId)

            if (!placedItemTile.seedGrowthInfo)
                throw new PlacedItemTileNotPlantedException(request.placedItemTileId)

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater)
                throw new PlacedItemTileNotNeedWaterException(request.placedItemTileId)

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                water: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // substract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })
            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })
            
            await queryRunner.startTransaction()
            try {
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
                        currentState: CropCurrentState.Normal
                    }
                )
                await queryRunner.commitTransaction()
            }
            catch (error) {
                this.logger.error("Water transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new WaterTransactionFailedException(error)
            }  
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
