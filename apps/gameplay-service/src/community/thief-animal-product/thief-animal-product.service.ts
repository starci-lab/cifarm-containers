import { Injectable, Logger } from "@nestjs/common"
import {
    HaverstQuantityRemainingEqualMinHarvestQuantityException,
    PlacedItemAnimalNotCurrentlyYieldingException,
    PlacedItemAnimalNotFoundException,
    ThiefAnimalProductTransactionFailedException
} from "@src/exceptions"
import { DataSource } from "typeorm"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    CropRandomness,
    GameplayPostgreSQLService,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    PlacedItemType,
    ProductType,
    SystemEntity,
    SystemId,
    UserEntity
} from "@src/databases"
import { EnergyService, InventoryService, LevelService, ThiefService } from "@src/gameplay"
import { ThiefAnimalProductRequest, ThiefAnimalProductResponse } from "./thief-animal-product.dto"
import { KafkaClientService, KafkaPattern } from "@src/brokers"
import { ClientKafka } from "@nestjs/microservices"

@Injectable()
export class ThiefAnimalProductService {
    private readonly logger = new Logger(ThiefAnimalProductService.name)

    private readonly dataSource: DataSource
    private readonly clientKafka: ClientKafka
    constructor(
        private readonly kafkaClientService: KafkaClientService,
        private readonly gameplayPostgreSqlService: GameplayPostgreSQLService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        private readonly theifService: ThiefService,
        private readonly inventoryService: InventoryService
    ) {
        this.dataSource = this.gameplayPostgreSqlService.getDataSource()
        this.clientKafka = this.kafkaClientService.getClient()
    }

    async theifAnimalProduct(
        request: ThiefAnimalProductRequest
    ): Promise<ThiefAnimalProductResponse> {
        this.logger.debug(`Theif animal product for user ${request.neighborUserId}`)

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            // get placed item
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    userId: request.neighborUserId,
                    id: request.placedItemAnimalId,
                    placedItemType: {
                        type: PlacedItemType.Animal
                    }
                },
                relations: {
                    animalInfo: true,
                    placedItemType: true
                }
            })

            if (!placedItemAnimal) {
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)
            }

            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
                throw new PlacedItemAnimalNotCurrentlyYieldingException(request.placedItemAnimalId)
            }

            if (
                placedItemAnimal.animalInfo.harvestQuantityRemaining ===
                placedItemAnimal.animalInfo.animal.minHarvestQuantity
            ) {
                throw new HaverstQuantityRemainingEqualMinHarvestQuantityException(
                    placedItemAnimal.seedGrowthInfo.crop.minHarvestQuantity
                )
            }

            const { value: activitiesValue } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                thiefAnimalProduct: { energyConsume, experiencesGain }
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
            const { value: computedQuantity } = this.theifService.compute({
                thief2,
                thief3
            })

            //get the actual quantity
            const actualQuantity = Math.min(
                computedQuantity,
                placedItemAnimal.seedGrowthInfo.harvestQuantityRemaining -
                    placedItemAnimal.seedGrowthInfo.crop.minHarvestQuantity
            )

            // get inventories
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Animal,
                        animalId: placedItemAnimal.animalInfo.animal.id
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

            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryTypeId: inventoryType.id,
                    quantity: placedItemAnimal.seedGrowthInfo.harvestQuantityRemaining
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
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
                    harvestQuantityRemaining:
                        placedItemAnimal.animalInfo.harvestQuantityRemaining - actualQuantity
                })
                await queryRunner.commitTransaction()
            } catch (error) {
                this.logger.error(`Theif animal product transaction failed: ${error}`)
                await queryRunner.rollbackTransaction()
                throw new ThiefAnimalProductTransactionFailedException(error)
            }

            this.clientKafka.emit(KafkaPattern.PlacedItemsBroadcast, {
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
