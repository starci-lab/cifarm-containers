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
    SupplyType,
    SystemEntity,
    SystemId,
    UserSchema
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { UseFertilizerRequest, UseFertilizerResponse } from "./use-fertilizer.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { InjectKafka, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class UseFertilizerService {
    private readonly logger = new Logger(UseFertilizerService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka
    ) {}

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

            if (placedItemTile.seedGrowthInfo.isFertilized)
                throw new GrpcFailedPreconditionException("Tile is already fertilized")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                useFertilizer: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            const fertilizer = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id: SupplyId.BasicFertilizer }
            })

            //inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    userId: user.id,
                    id: request.inventoryFertilizerId,
                    inventoryType: {
                        supply: {
                            type: SupplyType.Fertilizer
                        },
                        type: InventoryType.Supply
                    }
                },
                relations: {
                    inventoryType: true
                }
            })

            if (!inventory) throw new GrpcNotFoundException("Fertilizer not found in inventory")

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

            await queryRunner.startTransaction()
            try {
                //Decrease invetory
                await queryRunner.manager.update(InventoryEntity, inventory.id, {
                    quantity: inventory.quantity - 1
                })

                await queryRunner.manager.update(UserSchema, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // update seed growth info
                await queryRunner.manager.update(
                    SeedGrowthInfoEntity,
                    placedItemTile.seedGrowthInfo.id,
                    {
                        currentStageTimeElapsed:
                            placedItemTile.seedGrowthInfo.currentStageTimeElapsed +
                            fertilizer.fertilizerEffectTimeReduce,
                        isFertilized: true
                    }
                )

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
