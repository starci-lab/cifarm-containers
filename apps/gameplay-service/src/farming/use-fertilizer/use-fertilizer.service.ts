import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    GameplayPostgreSQLService,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SupplyId,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import {
    InventoryNotFoundException,
    PlacedItemNotNeedUseFertilizerException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotPlantedException,
    UseFertilizerTransactionFailedException
} from "@src/exceptions"
import { EnergyService, LevelService } from "@src/services"
import { DataSource } from "typeorm"
import { UseFertilizerRequest, UseFertilizerResponse } from "./use-fertilizer.dto"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)
    
    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgresqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
        this.dataSource = this.gameplayPostgresqlService.getDataSource()
    }

    async useFertilizer(request: UseFertilizerRequest): Promise<UseFertilizerResponse> {
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

            if (placedItemTile.seedGrowthInfo.currentState == CropCurrentState.IsFertilized)
                throw new PlacedItemNotNeedUseFertilizerException(request.placedItemTileId)

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                useFertilizer: { energyConsume, experiencesGain }
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

            //inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    userId: user.id,
                    inventoryType: {
                        id: SupplyId.BasicFertilizer,
                        type: InventoryType.Supply
                    }
                },
                relations: {
                    inventoryType: true
                }
            })

            if(!inventory) throw new InventoryNotFoundException()

            await queryRunner.startTransaction()
            try {
                //Decrease invetory
                await queryRunner.manager.update(InventoryEntity, inventory.id, {
                    quantity: inventory.quantity - 1
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update seed growth info
                await queryRunner.manager.update(
                    SeedGrowthInfoEntity,
                    placedItemTile.seedGrowthInfo.id,
                    {
                        currentState: CropCurrentState.IsFertilized
                    }
                )

                await queryRunner.commitTransaction()
                return {}
            } catch (error) {
                this.logger.error("Use Fertilizer transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new UseFertilizerTransactionFailedException(error)
            } 
        }
        finally {
            await queryRunner.release()
        }
    }
}
