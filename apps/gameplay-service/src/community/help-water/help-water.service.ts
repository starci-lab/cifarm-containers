import { Injectable, Logger } from "@nestjs/common"
import {
    HelpWaterTransactionFailedException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotNeedWaterException,
    PlacedItemTileNotPlantedException,
} from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    Activities,
    CropCurrentState,
    GameplayPostgreSQLService,
    PlacedItemEntity,
    PlacedItemType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, LevelService } from "@src/services"
import { HelpWaterRequest, HelpWaterResponse } from "./help-water.dto"

@Injectable()
export class HelpWaterService {
    private readonly logger = new Logger(HelpWaterService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgresqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
        this.dataSource = this.gameplayPostgresqlService.getDataSource()
    }

    async helpWater(request: HelpWaterRequest): Promise<HelpWaterResponse> {
        this.logger.debug(`Help water for user ${request.neighborUserId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // get placed item
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    userId: request.neighborUserId,
                    id: request.placedItemTileId,
                    placedItemType: {
                        type: PlacedItemType.Tile
                    }
                },
                relations: {
                    seedGrowthInfo: true,
                    placedItemType: true
                }
            })

            if (!placedItemTile) {
                throw new PlacedItemTileNotFoundException(request.placedItemTileId)
            }

            if (!placedItemTile.seedGrowthInfo) {
                throw new PlacedItemTileNotPlantedException(request.placedItemTileId)
            }

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.NeedWater) {
                throw new PlacedItemTileNotNeedWaterException(request.placedItemTileId)
            }

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                helpWater: { energyConsume, experiencesGain }
            } = value as Activities
            
            //get user
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

                // update crop info
                await queryRunner.manager.update(
                    SeedGrowthInfoEntity,
                    placedItemTile.seedGrowthInfo.id,
                    {
                        currentState: CropCurrentState.Normal
                    }
                )

                await queryRunner.commitTransaction()
                return {}
            } catch (error) {
                this.logger.error(`Failed to help water for user ${request.neighborUserId}`)
                await queryRunner.rollbackTransaction()
                throw new HelpWaterTransactionFailedException(error)
            } 
        } finally {
            await queryRunner.release()
        }
    }
}
