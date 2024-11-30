import { Inject, Injectable, Logger } from "@nestjs/common"
import {
    HaverstQuantityRemainingEqualMinHarvestQuantityException,
    HelpUseHerbicideTransactionFailedException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotFullyMaturedException,
    PlacedItemTileNotNeedUseHerbicideException,
    PlacedItemTileNotPlantedException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    Activities,
    CropCurrentState,
    CropRandomness,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { EnergyService, InventoryService, LevelService, TheifService } from "@src/services"
import { TheifCropRequest, TheifCropResponse } from "./theif-crop.dto"
import { ClientKafka } from "@nestjs/microservices"
import { kafkaConfig } from "@src/config"

@Injectable()
export class TheifCropService {
    private readonly logger = new Logger(TheifCropService.name)

    constructor(
        @Inject(kafkaConfig.broadcastPlacedItems.name)
        private readonly clientKafka: ClientKafka,
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly theifService: TheifService,
        private readonly inventoryService: InventoryService,
    ) {}

    async theifCrop(request: TheifCropRequest): Promise<TheifCropResponse> {
        this.logger.debug(`Theif crop for user ${request.neighborUserId}`)

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
                    seedGrowthInfo: {
                        crop: true
                    },
                    placedItemType: true
                }
            })

            if (!placedItemTile) {
                throw new PlacedItemTileNotFoundException(request.placedItemTileId)
            }

            if (!placedItemTile.seedGrowthInfo) {
                throw new PlacedItemTileNotPlantedException(request.placedItemTileId)
            }

            if (!placedItemTile.seedGrowthInfo.fullyMatured) {
                throw new PlacedItemTileNotFullyMaturedException(request.placedItemTileId)
            }

            if (
                placedItemTile.seedGrowthInfo.harvestQuantityRemaining ===
                placedItemTile.seedGrowthInfo.crop.minHarvestQuantity
            ) {
                throw new HaverstQuantityRemainingEqualMinHarvestQuantityException(
                    placedItemTile.seedGrowthInfo.crop.minHarvestQuantity
                )
            }

            const { value: activitiesValue } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                thiefCrop: { energyConsume, experiencesGain }
            } = activitiesValue as Activities

            //get user
            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.CropRandomness }
            })
            const { theif2, theif3 } = value as CropRandomness
            const { value: computedQuantity } = this.theifService.compute({
                theif2,
                theif3
            })

            //get the actual quantity
            const actualQuantity = Math.min(
                computedQuantity,
                placedItemTile.seedGrowthInfo.harvestQuantityRemaining -
                    placedItemTile.seedGrowthInfo.crop.minHarvestQuantity
            )

            // get inventories
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    type: InventoryType.Product,
                    product: {
                        
                    }
                }
            })

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
                    inventoryTypeId: inventoryType.id,
                    quantity: placedItemTile.seedGrowthInfo.harvestQuantityRemaining
                }
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
            } catch (error) {
                this.logger.error(`Help use herbicide failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new HelpUseHerbicideTransactionFailedException(error)
            }

            this.clientKafka.emit(kafkaConfig.broadcastPlacedItems.pattern, {
                userId: request.neighborUserId
            })

            return {}
        } finally {
            await queryRunner.release()
        }
    }
}