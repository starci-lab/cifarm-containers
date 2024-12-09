import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    ProductEntity,
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
    HaverstCropTransactionFailedException,
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
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemTileId },
                relations: {
                    seedGrowthInfo: {
                        crop: true
                    }
                }
            })

            if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.placedItemTileId)

            if (!placedItemTile.seedGrowthInfo)
                throw new PlacedItemTileNotPlantedException(request.placedItemTileId)

            if (!placedItemTile.seedGrowthInfo.fullyMatured)
                throw new PlacedItemTileNotFullyMaturedException(request.placedItemTileId)

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

            //get corresponding inventory type
            const product = await queryRunner.manager.findOne(ProductEntity, {
                where: {
                    crop: {
                        id: placedItemTile.seedGrowthInfo.crop.id
                    }
                },
                relations: {
                    crop: true
                }
            })

            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    type: InventoryType.Product,
                    productId: product.id
                }
            })

            // Get inventories same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryTypeId: inventoryType.id
                }
            })

            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryType: inventoryType,
                    quantity: placedItemTile.seedGrowthInfo.harvestQuantityRemaining
                }
            })

            await queryRunner.startTransaction()
            
            try {
            // update user
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                //if current perennial count is equal to crop's perennial count, remove the crop, delete the seed growth info
                if (
                    placedItemTile.seedGrowthInfo.currentPerennialCount >=
                placedItemTile.seedGrowthInfo.crop.perennialCount
                ) {
                    await queryRunner.manager.remove(
                        SeedGrowthInfoEntity,
                        placedItemTile.seedGrowthInfo
                    )
                } else {
                // update seed growth info
                    await queryRunner.manager.update(
                        SeedGrowthInfoEntity,
                        placedItemTile.seedGrowthInfo.id,
                        {
                            currentPerennialCount:
                            placedItemTile.seedGrowthInfo.currentPerennialCount + 1,
                            fullyMatured: false,
                            currentStageTimeElapsed: 0
                        }
                    )
                }
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Harvest crop transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new HaverstCropTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
