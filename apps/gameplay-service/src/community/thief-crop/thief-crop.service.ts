import { Inject, Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { kafkaConfig, KafkaConfigKey, KafkaPlacedItemPattern } from "@src/config"
import {
    Activities,
    CropCurrentState,
    CropRandomness,
    GameplayPostgreSQLService,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import {
    HaverstQuantityRemainingEqualMinHarvestQuantityException,
    PlacedItemTileNotFoundException,
    PlacedItemTileNotFullyMaturedException,
    PlacedItemTileNotPlantedException,
    ThiefCropTransactionFailedException
} from "@src/exceptions"
import { EnergyService, InventoryService, LevelService, ThiefService } from "@src/services"
import { DataSource } from "typeorm"
import { ThiefCropRequest, ThiefCropResponse } from "./thief-crop.dto"

@Injectable()
export class TheifCropService{
    private readonly logger = new Logger(TheifCropService.name)

    private readonly dataSource: DataSource
    constructor(
        @Inject(kafkaConfig[KafkaConfigKey.PlacedItems].name)
        private readonly clientKafka: ClientKafka,
        private readonly gameplayPostgresqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService,
    ) {
        this.dataSource = this.gameplayPostgresqlService.getDataSource()
    }

    async theifCrop(request: ThiefCropRequest): Promise<ThiefCropResponse> {
        this.logger.debug(`Thief crop for user ${request.neighborUserId}`)

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

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured) {
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
            const { thief2, thief3 } = value as CropRandomness
            const { value: computedQuantity } = this.thiefService.compute({
                thief2,
                thief3
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
                        cropId: placedItemTile.seedGrowthInfo.crop.id
                    }
                },
                relations: {
                    product: true
                }
            })

            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: request.userId,
                    inventoryTypeId: inventoryType.id
                }
            })
            console.log(existingInventories)
            
            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryType,
                    quantity: actualQuantity
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

                // update inventories
                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                // update seed growth info
                await queryRunner.manager.update(
                    SeedGrowthInfoEntity,
                    placedItemTile.seedGrowthInfo.id,
                    {
                        harvestQuantityRemaining:
                            placedItemTile.seedGrowthInfo.harvestQuantityRemaining - actualQuantity
                    }
                )
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Theif crop transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new ThiefCropTransactionFailedException(error)
            }

            this.clientKafka.emit(kafkaConfig[KafkaConfigKey.PlacedItems].patterns[KafkaPlacedItemPattern.Broadcast], {
                userId: request.neighborUserId
            })
            return {
                quantity: actualQuantity
            }
        } finally {
            await queryRunner.release()
        }
    }
}
