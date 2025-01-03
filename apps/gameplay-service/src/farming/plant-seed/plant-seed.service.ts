import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropEntity,
    GameplayPostgreSQLService,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { DataSource } from "typeorm"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"
import {
    InventoryNotFoundException,
    PlacedItemTileAlreadyHasSeedException,
    PlacedItemTileNotFoundException,
    PlantSeedTransactionFailedException,
} from "@src/exceptions"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    private readonly dataSource: DataSource
    constructor(
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
    }

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
                    id: request.placedItemTileId
                }
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

            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })
            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })

            // update inventory
            const quantityChanges = this.inventoryService.remove({
                entity: inventory,
                quantity: 1
            })

            //get the crop
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: inventory.inventoryType.cropId }
            })

            await queryRunner.startTransaction()
            try {
                // update user
                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update inventory
                if (!quantityChanges.quantity) {
                    await queryRunner.manager.remove(InventoryEntity, inventory)
                } else {
                    await queryRunner.manager.update(InventoryEntity, inventory.id, {
                        ...quantityChanges
                    })
                }

                // create seed growth info
                await queryRunner.manager.save(SeedGrowthInfoEntity, {
                    placedItemId: placedItemTile.id,
                    harvestQuantityRemaining: crop.maxHarvestQuantity,
                    cropId: crop.id
                })

                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error("Plant seed transaction failed, rolling back...", error)
                await queryRunner.rollbackTransaction()
                throw new PlantSeedTransactionFailedException(error)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
