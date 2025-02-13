import { Injectable, Logger } from "@nestjs/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import {
    Activities,
    CropCurrentState,
    CropRandomness,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemSchema,
    PlacedItemType,
    ProductType,
    SeedGrowthInfoEntity,
    SystemEntity,
    SystemId,
    UserSchema
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, ThiefService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { ThiefCropRequest, ThiefCropResponse } from "./thief-crop.dto"
import { GrpcInternalException, GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class ThiefCropService {
    private readonly logger = new Logger(ThiefCropService.name)
    constructor(
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly thiefService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {}

    async thiefCrop(request: ThiefCropRequest): Promise<ThiefCropResponse> {
        if (request.userId === request.neighborUserId) {
            throw new GrpcInvalidArgumentException("Cannot thief from yourself")
        }

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // get placed item
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemSchema, {
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
                throw new GrpcNotFoundException("Tile not found")
            }

            if (!placedItemTile.seedGrowthInfo) {
                throw new GrpcNotFoundException("Tile is not planted")
            }

            if (placedItemTile.seedGrowthInfo.currentState !== CropCurrentState.FullyMatured) {
                throw new GrpcFailedPreconditionException("Crop is not fully matured")
            }

            if (
                placedItemTile.seedGrowthInfo.harvestQuantityRemaining ===
                placedItemTile.seedGrowthInfo.crop.minHarvestQuantity
            ) {
                throw new GrpcFailedPreconditionException("Crop's thief limit has been reached")
            }

            const { value: activitiesValue } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                thiefCrop: { energyConsume, experiencesGain }
            } = activitiesValue as Activities

            //get user
            const user = await queryRunner.manager.findOne(UserSchema, {
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
                        cropId: placedItemTile.seedGrowthInfo.crop.id,
                        type: ProductType.Crop,
                        isQuality: placedItemTile.seedGrowthInfo.isQuality
                    }
                },
                relations: {
                    product: true,
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
                await queryRunner.manager.update(UserSchema, user.id, {
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
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            this.clientKafka.emit(KafkaPattern.PlacedItems, {
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
