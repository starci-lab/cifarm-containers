import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    SupplyEntity,
    SupplyId,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { UseFertilizerRequest, UseFertilizerResponse } from "./use-fertilizer.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)
    
    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
    }

    async useFertilizer(request: UseFertilizerRequest): Promise<UseFertilizerResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()
        try {
            const placedItemTile = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemTileId },
                relations: {
                    seedGrowthInfo: true
                }
            })

            if (!placedItemTile) throw new GrpcNotFoundException("Tile not found")

            if (!placedItemTile.seedGrowthInfo)
                throw new GrpcNotFoundException("Tile is not planted")
            
            const { seedGrowthInfo } = placedItemTile

            if (seedGrowthInfo.isFertilized)
                throw new GrpcFailedPreconditionException("Tile is already fertilized")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                useFertilizer: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            const fertilizer = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id: SupplyId.BasicFertilizer }
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

            //inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    userId: user.id,
                    inventoryType: {
                        id: SupplyId.BasicFertilizer,
                        type: InventoryType.Supply
                    }
                },
                relations: {
                    inventoryType: true
                }
            })

            if (!inventory) throw new GrpcNotFoundException("Fertilizer not found in inventory")

            await queryRunner.startTransaction()
            try {
                //Decrease invetory
                await queryRunner.manager.update(InventoryEntity, inventory.id, {
                    quantity: inventory.quantity - 1
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update seed growth info
                await queryRunner.manager.update(
                    SeedGrowthInfoEntity,
                    seedGrowthInfo.id,
                    {
                        currentStageTimeElapsed: seedGrowthInfo.currentStageTimeElapsed + fertilizer.fertilizerEffectTimeReduce,
                        isFertilized: true
                    }
                )

                await queryRunner.commitTransaction()
                return {}
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            } 
        }catch (error) {
            this.logger.error("Use Fertilizer failed", error)
            throw error
        }
        finally {
            await queryRunner.release()
        }
    }
}
