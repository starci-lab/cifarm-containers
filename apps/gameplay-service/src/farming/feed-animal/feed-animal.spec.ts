//npx jest apps/gameplay-service/src/farming/feed-animal/feed-animal.spec.ts

import {
    AnimalCurrentState,
    AnimalId,
    InventoryEntity,
    InventoryType,
    InventoryTypeEntity,
    PlacedItemEntity,
    SupplyId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { FeedAnimalRequest } from "./feed-animal.dto"
import { FeedAnimalModule } from "./feed-animal.module"
import { FeedAnimalService } from "./feed-animal.service"

describe("FeedAnimalService", () => {
    let dataSource: DataSource
    let service: FeedAnimalService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER,
        energy: 10,
        experiences: 0,
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [FeedAnimalModule],
        })
        dataSource = ds
        service = module.get<FeedAnimalService>(FeedAnimalService)
    })

    it("Should successfully feed a hungry animal", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        // Create mock user
        const user = await queryRunner.manager.save(UserEntity, mockUser)

        // Create mock placed item
        const placedItem = await queryRunner.manager.save(PlacedItemEntity, {
            userId: user.id,
            x: 0,
            y: 0,
            animalInfo: {
                currentState: AnimalCurrentState.Hungry,
                animalId: AnimalId.Cow,
            },
        })

        const inventoryType = await queryRunner.manager.findOne(InventoryTypeEntity, {
            where: {
                type: InventoryType.Supply,
                supplyId: SupplyId.AnimalFeed,
            },
        })

        // Create mock inventory
        const inventory = await queryRunner.manager.save(InventoryEntity, {
            userId: user.id,
            quantity: 5,
            inventoryType
        })

        console.log(inventory)

        await queryRunner.startTransaction()

        try {
            const request: FeedAnimalRequest = {
                userId: user.id,
                placedItemAnimalId: placedItem.id,
            }

            // Execute the service method
            const response = await service.feedAnimal(request)

            // Verify animal state updated
            const placedItemAnimal = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: placedItem.id },
                relations: { animalInfo: true },
            })
            expect(placedItemAnimal.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
            expect(placedItemAnimal.animalInfo.currentHungryTime).toBe(0)

            // Verify inventory updated
            const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { id: inventory.id },
            })
            expect(updatedInventory.quantity).toBe(4)

            expect(response).toEqual({})
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
            await queryRunner.manager.delete(UserEntity, { id: mockUser.id })
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
