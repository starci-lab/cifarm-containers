import { Injectable, Logger } from "@nestjs/common"
import { InventoryEntity, InventoryType, InventoryTypeEntity, PlacedItemEntity } from "@src/database"
import { AnimalNotCurrentlyYieldingException, PlacedItemAnimalNotFoundException } from "@src/exceptions"
import { InventoryService } from "@src/services"
import { DataSource } from "typeorm"
import { CollectAnimalProductRequest, CollectAnimalProductResponse } from "./collect-animal-product.dto"

@Injectable()
export class CollectAnimalProductService {
    private readonly logger = new Logger(CollectAnimalProductService.name)

    constructor(
        private readonly dataSource: DataSource,
        private readonly inventoryService: InventoryService
    ) {}

    async collectAnimalProduct(request: CollectAnimalProductRequest): Promise<CollectAnimalProductResponse> {
        this.logger.debug(
            `Starting collect animal product for placedItem ${request?.placedItemAnimalId}`
        )

        const queryRunner = this.dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: request.placedItemAnimalId },
                relations: {
                    animalInfo: {
                        animal: true
                    }
                }
            })
    
            if (!placedItem) {
                throw new PlacedItemAnimalNotFoundException(request.placedItemAnimalId)
            }
    
            const animalInfo = placedItem.animalInfo
    
            if (!animalInfo || !animalInfo.hasYielded) {
                throw new AnimalNotCurrentlyYieldingException(request.placedItemAnimalId)
            }
    
            // Reset the animal's yield status
            animalInfo.hasYielded = false
            placedItem.animalInfo = animalInfo

            //Get inventory type
            const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
                where: { product: 
                    {
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
                    inventoryTypeId: inventoryType.id,
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
                const savedInventory = await queryRunner.manager.save(InventoryEntity, updatedInventories)
    
                // Save updated placed item
                await queryRunner.manager.save(PlacedItemEntity, placedItem)
    
                // Commit transaction
                await queryRunner.commitTransaction()
    
                // Last inventory saved is the animal product
                return {
                    inventoryAnimalProductId: savedInventory[savedInventory.length - 1].id
                }
            } catch (error) {
                await queryRunner.rollbackTransaction()
                this.logger.error("Collect Animal Product transaction failed", error)
                throw error
            }
        } finally {
            await queryRunner.release()
        }
    }
}
