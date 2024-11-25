import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemType,
    ProductEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { DataSource } from "typeorm"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"
import {
    InventoryNotFoundException,
    PlacedItemTileNotFoundException,
    WaterTransactionFailedException
} from "@src/exceptions"
import { EnergyService, InventoryService, LevelService } from "@src/services"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)
    constructor(
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService
    ) {}

    async plantSeed(request: PlantSeedRequest): Promise<PlantSeedResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        const inventory = await queryRunner.manager.findOne(InventoryEntity, {
            where: {
                id: request.inventorySeedId,
                inventoryType: {
                    type: InventoryType.Seed
                }
            },
            relations: {
                inventoryType: true
            }
        })
        if (!inventory) throw new InventoryNotFoundException(request.inventorySeedId)

        //check the tile
        const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
            where: {
                id: request.placedItemTileId,
                placedItemType: {
                    type: PlacedItemType.Tile
                }
            },
            relations: {
                placedItemType: true
            }
        })
        if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.placedItemTileId)

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
                    inventoryTypeId: inventoryType.id,
                    quantity: placedItemTile.seedGrowthInfo.harvestQuantityRemaining
                }
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
