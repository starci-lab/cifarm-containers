import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    PlacedItemEntity,
    PlacedItemType,
    SupplyId,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import { FeedAnimalRequest, FeedAnimalResponse } from "./feed-animal.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class FeedAnimalService {
    private readonly logger = new Logger(FeedAnimalService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService
    ) {
    }

    async feedAnimal(request: FeedAnimalRequest): Promise<FeedAnimalResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: request.placedItemAnimalId,
                    userId: request.userId,
                    placedItemType: {
                        type: PlacedItemType.Animal
                    }
                },
                relations: {
                    animalInfo: true
                }
            })

            if (!placedItemAnimal || !placedItemAnimal.animalInfo)
                throw new GrpcNotFoundException("Animal not found")

            const { animalInfo } = placedItemAnimal
            if (animalInfo.currentState !== AnimalCurrentState.Hungry)
                throw new GrpcFailedPreconditionException("Animal is not hungry")

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                feedAnimal: { energyConsume, experiencesGain }
            } = value as Activities

            const user = await queryRunner.manager.findOne(UserEntity, {
                where: { id: request.userId }
            })

            this.energyService.checkSufficient({
                current: user.energy,
                required: energyConsume
            })

            // Subtract energy
            const energyChanges = this.energyService.substract({
                entity: user,
                energy: energyConsume
            })
            // Update user energy and experience
            const experiencesChanges = this.levelService.addExperiences({
                entity: user,
                experiences: experiencesGain
            })

            // Inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    userId: user.id,
                    // Inventory type is Supply
                    inventoryType: {
                        type: InventoryType.Supply,
                        supplyId: SupplyId.AnimalFeed
                    }
                },
                relations: {
                    inventoryType: true
                }
            })

            if (!inventory) throw new GrpcNotFoundException("Inventory not found")

            if (inventory.inventoryType.type !== InventoryType.Supply)
                throw new GrpcFailedPreconditionException("Inventory type is not supply")

            await queryRunner.startTransaction()
            try {
                // Decrease inventory
                await queryRunner.manager.update(InventoryEntity, inventory.id, {
                    quantity: inventory.quantity - 1
                })

                await queryRunner.manager.update(UserEntity, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // Update animal state
                await queryRunner.manager.update(AnimalInfoEntity, animalInfo.id, {
                    currentState: AnimalCurrentState.Normal,
                    currentHungryTime: 0
                })

                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
