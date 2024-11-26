import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropEntity,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/database"
import { DataSource } from "typeorm"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"
import {
    InventoryNotFoundException,
    PlacedItemTileAlreadyHasSeedException,
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
        try {
            // substract energy
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
                },
            })
            if (!placedItemTile) throw new PlacedItemTileNotFoundException(request.placedItemTileId)
            if (placedItemTile.seedGrowthInfo)
                throw new PlacedItemTileAlreadyHasSeedException(request.placedItemTileId)

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

            // update inventory
            const updatedInventory = this.inventoryService.remove({
                entity: inventory,
                quantity: 1
            })
            if (this.inventoryService.checkDelete({ entity: updatedInventory })) {
                await queryRunner.manager.remove(InventoryEntity, updatedInventory)
            } else {
                await queryRunner.manager.save(InventoryEntity, updatedInventory)
            }

            //get the crop
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: inventory.inventoryType.cropId }
            })

            // create seed growth info
            await queryRunner.manager.save(SeedGrowthInfoEntity, {
                placedItemId: placedItemTile.id,
                harvestQuantityRemaining: crop.maxHarvestQuantity
            })

            await queryRunner.commitTransaction()
            return {}
        } catch (error) {
            this.logger.error("Plant seed transaction failed, rolling back...", error)
            await queryRunner.rollbackTransaction()
            throw new WaterTransactionFailedException(error)
        } finally {
            await queryRunner.release()
        }
    }
}
