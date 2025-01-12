//npx jest apps/gameplay-service/src/farming/collect-animal-product/collect-animal-product.spec.ts

import {
    AnimalCurrentState,
    AnimalId,
    InventoryEntity,
    PlacedItemEntity,
    ProductId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { CollectAnimalProductRequest } from "./collect-animal-product.dto"
import { CollectAnimalProductModule } from "./collect-animal-product.module"
import { CollectAnimalProductService } from "./collect-animal-product.service"

describe("CollectAnimalProductService", () => {
    let dataSource: DataSource
    let service: CollectAnimalProductService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [CollectAnimalProductModule]
        })
        dataSource = ds
        service = module.get<CollectAnimalProductService>(CollectAnimalProductService)
    })

    it("Should collect animal product successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        const userInDB = await queryRunner.manager.save(UserEntity, mockUser)

        const placedItemAnimal: DeepPartial<PlacedItemEntity> = {
            userId: userInDB.id,
            animalInfo: {
                animalId: AnimalId.Chicken,
                harvestQuantityRemaining: 10,
                isAdult: true,
                currentState: AnimalCurrentState.Yield,
            },
            x: 0,
            y: 0,
        }

        const animalInfo = await queryRunner.manager.save(PlacedItemEntity, placedItemAnimal)

        await queryRunner.startTransaction()

        try {
            const request: CollectAnimalProductRequest = {
                userId: userInDB.id,
                placedItemAnimalId: animalInfo.id
            }

            // Collect animal product
            await service.collectAnimalProduct(request)

            // Verify inventory was created
            const inventories = await queryRunner.manager.find(InventoryEntity, {
                where: {
                    userId: userInDB.id,
                    inventoryType: {
                        productId: ProductId.Egg
                    }
                },
                relations: { inventoryType: true }
            })

            expect(inventories).toBeDefined()

            // Verify animal yield status reset
            const updatedPlacedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: animalInfo.id },
                relations: { animalInfo: true }
            })

            console.log(updatedPlacedItem)

            expect(updatedPlacedItem.animalInfo.harvestQuantityRemaining).toBe(0)
            expect(updatedPlacedItem.animalInfo.currentState).toBe(AnimalCurrentState.Normal)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, mockUser)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
