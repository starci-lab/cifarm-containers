import { Injectable, Logger } from "@nestjs/common"
import {
    Activities,
    AnimalCurrentState,
    AnimalInfoEntity,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemSchema,
    PlacedItemType,
    ProductType,
    SystemEntity,
    SystemId,
    UserSchema
} from "@src/databases"
import { ProductService, EnergyService, InventoryService, LevelService } from "@src/gameplay"
import { DataSource } from "typeorm"
import {
    CollectAnimalProductRequest,
    CollectAnimalProductResponse
} from "./collect-animal-product.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { ClientKafka } from "@nestjs/microservices"
import { InjectKafka, KafkaPattern } from "@src/brokers"

@Injectable()
export class CollectAnimalProductService {
    private readonly logger = new Logger(CollectAnimalProductService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService,
        private readonly energyService: EnergyService,
        private readonly levelService: LevelService,
        @InjectKafka()
        private readonly clientKafka: ClientKafka,
        private readonly productService: ProductService
    ) {}

    async collectAnimalProduct(
        request: CollectAnimalProductRequest
    ): Promise<CollectAnimalProductResponse> {
        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemSchema, {
                where: {
                    id: request.placedItemAnimalId,
                    userId: request.userId,
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
                throw new GrpcNotFoundException("Animal not found")
            }

            if (placedItemAnimal.animalInfo.currentState !== AnimalCurrentState.Yield) {
                throw new GrpcFailedPreconditionException("Animal is not ready to collect product")
            }

            //Get product
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    product: {
                        type: ProductType.Animal,
                        animalId: placedItemAnimal.placedItemType.animalId,
                        isQuality: placedItemAnimal.animalInfo.isQuality
                    },
                    type: InventoryType.Product
                }
            })

            //Get inventories same type
            const existingInventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    inventoryTypeId: inventoryType.id
                },
                relations: {
                    inventoryType: {
                        product: true
                    }
                }
            })

            const updatedInventories = this.inventoryService.add({
                entities: existingInventories,
                userId: request.userId,
                data: {
                    inventoryType: inventoryType,
                    quantity: placedItemAnimal.animalInfo.harvestQuantityRemaining
                }
            })

            const user = await queryRunner.manager.findOne(UserSchema, {
                where: { id: request.userId }
            })

            const { value } = await queryRunner.manager.findOne(SystemEntity, {
                where: { id: SystemId.Activities }
            })
            const {
                cureAnimal: { energyConsume, experiencesGain }
            } = value as Activities

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

            // update animal info after collect
            const animalInfoAfterCollectChanges = this.productService.updateAnimalInfoAfterCollect({
                entity: placedItemAnimal.animalInfo
            })

            queryRunner.startTransaction()

            try {
                //Save inventory
                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                // Save updated placed item
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
                    currentState: AnimalCurrentState.Normal,
                    harvestQuantityRemaining: 0,
                    ...animalInfoAfterCollectChanges
                })

                // Update user energy and experience
                await queryRunner.manager.update(UserSchema, user.id, {
                    ...energyChanges,
                    ...experiencesChanges
                })

                // Commit transaction
                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }

            // Publish event
            this.clientKafka.emit(KafkaPattern.PlacedItems, {
                userId: request.userId
            })
            return {}
        } finally {
            await queryRunner.release()
        }
    }
}
