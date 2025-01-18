import { Injectable, Logger } from "@nestjs/common"
import {
    AnimalCurrentState,
    AnimalInfoEntity,
    InjectPostgreSQL,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    ProductType
} from "@src/databases"
import { InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import {
    CollectAnimalProductRequest,
    CollectAnimalProductResponse
} from "./collect-animal-product.dto"
import { GrpcInternalException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

@Injectable()
export class CollectAnimalProductService {
    private readonly logger = new Logger(CollectAnimalProductService.name)

    constructor(
        @InjectPostgreSQL()
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService
    ) {}

    async collectAnimalProduct(
        request: CollectAnimalProductRequest
    ): Promise<CollectAnimalProductResponse> {
        this.logger.debug(
            `Starting collect animal product for placedItem ${request?.placedItemAnimalId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    id: request.placedItemAnimalId,
                    userId: request.userId
                },
                relations: {
                    animalInfo: {
                        animal: true
                    }
                }
            })

            if (!placedItemAnimal || placedItemAnimal.animalInfo) {
                throw new GrpcNotFoundException("Animal not found")
            }

            const { animalInfo } = placedItemAnimal
            if (animalInfo.currentState !== AnimalCurrentState.Yield) {
                throw new GrpcFailedPreconditionException("Animal is not ready to collect product")
            }

            //Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: {
                    product: {
                        type: ProductType.Animal,
                        animalId: animalInfo.animalId
                    },
                    type: InventoryType.Product
                },
                relations: {
                    product: true
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
                    quantity: animalInfo.harvestQuantityRemaining
                }
            })

            queryRunner.startTransaction()

            try {
                //Save inventory
                await queryRunner.manager.save(InventoryEntity, updatedInventories)

                // Save updated placed item
                await queryRunner.manager.update(AnimalInfoEntity, placedItemAnimal.animalInfo.id, {
                    currentState: AnimalCurrentState.Normal,
                    harvestQuantityRemaining: 0
                })

                // Commit transaction
                await queryRunner.commitTransaction()
            } catch (error) {
                const errorMessage = `Transaction failed, reason: ${error.message}`
                this.logger.error(errorMessage)
                await queryRunner.rollbackTransaction()
                throw new GrpcInternalException(errorMessage)
            }
            return {}
        } catch (error) {
            this.logger.error("Collect animal Product failed", error)
            throw error
        } finally {
            await queryRunner.release()
        }
    }
}
