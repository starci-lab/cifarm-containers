// npx jest apps/gameplay-service/src/farming/feed-animal/feed-animal.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { AnimalCurrentState, getMongooseToken, InventorySchema, InventoryTypeId, PlacedItemSchema, UserSchema } from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { FeedAnimalService } from "./feed-animal.service"


describe("FeedAnimalService", () => {
    let connection: Connection
    let service: FeedAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [FeedAnimalService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(FeedAnimalService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully feed an animal and update user and inventory", async () => {
        const user = await gameplayMockUserService.generate({ energy: 100, experiences: 0 })
        const placedItemAnimal = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            animalInfo: {
                currentState: AnimalCurrentState.Hungry
            }
        })

        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalFeed),
            quantity: 5
        })

        await service.feedAnimal({
            userId: user.id,
            placedItemAnimalId: placedItemAnimal.id.toString(),
            inventorySupplyId: inventory.id.toString()
        })

        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findById(user.id)
        expect(updatedUser.energy).toBe(90)
        expect(updatedUser.experiences).toBe(5)

        const updatedInventory = await connection.model<InventorySchema>(InventorySchema.name).findById(inventory._id)
        expect(updatedInventory.quantity).toBe(4)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
