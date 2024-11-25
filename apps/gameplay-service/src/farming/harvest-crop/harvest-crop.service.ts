import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { DataSource } from "typeorm"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import {
    PlacedItemTileNotFoundException,
    PlacedItemTileNotFullyMaturedException,
    PlacedItemTileNotPlantedException,
    WaterTransactionFailedException
} from "@src/exceptions"
import { EnergyService, InventoryService, LevelService } from "@src/services"

@Injectable()
export class HarvestCropService {
    private readonly logger = new Logger(HarvestCropService.name)
    constructor(
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService
    ) {}

    async harvestCrop(request: HarvestCropRequest): Promise<HarvestCropResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
            where: { id: request.id },
            relations: {
                seedGrowthInfo: true
            }
        })

        if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.id)

        if (placedItemTile.seedGrowthInfo.isPlanted)
            throw new PlacedItemTileNotPlantedException(request.id)

        if (!placedItemTile.seedGrowthInfo.fullyMatured)
            throw new PlacedItemTileNotFullyMaturedException(request.id)

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

        await queryRunner.startTransaction()
        try {
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
            
            // //Get inventory type
            // const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
            //     where: { productId:  }
            // })

            // // Get inventory same type
            // const existingInventories = await queryRunner.manager.find(InventoryEntity, {
            //     where: {
            //         userId: request.userId,
            //         inventoryType: {
            //             cropId: request.id
            //         }
            //     },
            //     relations: {
            //         inventoryType: true
            //     }
            // })
            // const updatedInventories = this.inventoryService.add({
            //     entities: existingInventories,
            //     userId: request.userId,
            //     data: {
            //         inventoryType: inventoryType,
            //         quantity: 1
            //     }
            // })


            // update seed growth info
            await queryRunner.manager.update(
                SeedGrowthInfoEntity,
                placedItemTile.seedGrowthInfo.id,
                {
                    ...placedItemTile.seedGrowthInfo,
                    fullyMatured: false,
                }
            )

            return {}
        } catch (error) {
            this.logger.error("Harvest crop transaction failed, rolling back...", error)
            await queryRunner.rollbackTransaction()
            throw new WaterTransactionFailedException(error)
        } finally {
            await queryRunner.release()
        }
    }
}
