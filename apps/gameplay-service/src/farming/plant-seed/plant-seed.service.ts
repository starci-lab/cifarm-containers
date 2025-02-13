import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    CropEntity,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    PlacedItemSchema,
    PlacedItemType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { PlantSeedRequest, PlantSeedResponse } from "./plant-seed.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class PlantSeedService {
    private readonly logger = new Logger(PlantSeedService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly inventoryService: InventoryService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
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
                    },
                    userId: request.userId
                },
                relations: {
                    inventoryType: true
                }
            })
            if (!inventory) throw new GrpcNotFoundException("Seed not found in inventory")

            //check the tile
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemSchema, {
                where: {
                    id: request.placedItemTileId,
                    userId: request.userId,
                    placedItemType: {
                        type: PlacedItemType.Tile
                    }
                },
                relations: {
                    seedGrowthInfo: true
                }
            })
           
            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")

            if (placedItemTile.seedGrowthInfo)
                throw new GrpcFailedPreconditionException("Tile is already planted")

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
                await queryRunner.manager.update(UserSchema, user.id, {
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
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: user.id
            })
            
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
