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
import {
    AnimalNotCurrentlyYieldingException,
    CollectAnimalProductTransactionFailedException,
    PlacedItemAnimalNotFoundException
} from "@src/exceptions"
import { InventoryService } from "@src/gameplay"
import { DataSource } from "typeorm"
import {
    CollectAnimalProductRequest,
    CollectAnimalProductResponse
} from "./collect-animal-product.dto"

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

            if (!placedItemAnimal) {
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)
            }

            const animalInfo = placedItemAnimal.animalInfo

            if (!animalInfo || animalInfo.currentState !== AnimalCurrentState.Yield) {
                throw new AnimalNotCurrentlyYieldingException(request.placedItemAnimalId)
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
                    currentState: AnimalCurrentState.Normal
                })

                // Commit transaction
                await queryRunner.commitTransaction()
            } catch (error) {
                await queryRunner.rollbackTransaction()
                this.logger.error("Collect Animal Product transaction failed", error)
                throw new CollectAnimalProductTransactionFailedException(error)
            }
            return {}
        } catch (error) {
            this.logger.error("Collect Animal Product failed", error)
            throw error
        } finally {
            await queryRunner.release()
        }
    }
}
