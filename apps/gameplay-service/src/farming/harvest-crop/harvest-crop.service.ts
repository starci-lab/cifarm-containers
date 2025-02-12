import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropCurrentState,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemType,
    ProductType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    TileInfoEntity,
    UserSchema
} from "@src/databases"
import { ProductService, EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { HarvestCropRequest, HarvestCropResponse } from "./harvest-crop.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class HarvestCropService {
    private readonly logger = new Logger(HarvestCropService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        private readonly productService: ProductService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

    async harvestCrop(request: HarvestCropRequest): Promise<HarvestCropResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: request.placedItemTileId,
                    userId: request.userId,
                    placedItemType: {
                        type: PlacedItemType.Tile
                    }
                },
                relations: {
                    seedGrowthInfo: {
                        crop: true
                    },
                    placedItemType: {
                        tile: true
                    },
                    tileInfo: true
                }
            })

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")

            if (!placedItemTile.seedGrowthInfo)
                throw new GrpcFailedPreconditionException("Tile is not planted")

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured)
                throw new GrpcFailedPreconditionException("Crop is not fully matured")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                water: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserSchema, {
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

            // compute quality chance
            const tileInfoAfterHarvestChanges = this.productService.updateTileInfoAfterHarvest({
                entity: placedItemTile.tileInfo
            })

            // get corresponding inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Crop,
                        cropId: placedItemTile.seedGrowthInfo.cropId,
                        isQuality: placedItemTile.seedGrowthInfo.isQuality
                    }
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
                    quantity: placedItemTile.seedGrowthInfo.harvestQuantityRemaining,
                }
            })

            await queryRunner.startTransaction()
            try {
                // update user
                await queryRunner.manager.update(UserSchema, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                //if current perennial count is equal to crop's perennial count - 1, remove the crop, delete the seed growth info
                if (
                    placedItemTile.seedGrowthInfo.currentPerennialCount + 1 >=
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
                            currentState: CropCurrentState.Normal,
                            currentStageTimeElapsed: 0
                        }
                    )
                }

                // update tile info
                await queryRunner.manager.update(
                    TileInfoEntity,
                    placedItemTile.tileInfoId,
                    {
                        ...tileInfoAfterHarvestChanges
                    }
                )

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            // Publish event to Kafka
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
                        
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
