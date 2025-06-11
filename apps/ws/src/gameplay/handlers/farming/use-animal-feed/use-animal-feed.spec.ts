// npx jest apps/ws/src/gameplay/handlers/farming/use-animal-feed/use-animal-feed.spec.ts

import { Test } from "@nestjs/testing"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { 
    AnimalCurrentState,
    getMongooseToken,
    InventoryKind, 
    InventorySchema,
    InventoryTypeId, 
    PlacedItemSchema, 
    PlacedItemTypeId,
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { UseAnimalFeedService } from "./use-animal-feed.service"

describe("UseAnimalFeedService", () => {
    let service: UseAnimalFeedService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseAnimalFeedService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(UseAnimalFeedService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully use animal feed", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing

        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            animalInfo: {
                currentState: AnimalCurrentState.Hungry,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.Chicken)
        })

        const inventorySupply = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalFeed),
            kind: InventoryKind.Tool,
            quantity: 5,
            index: 0,
        })
        // harvest 
        const { placedItems, action } = await service.useAnimalFeed(user, {
            placedItemAnimalId: placedItemTile.id,
            inventorySupplyId: inventorySupply.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        // get the inventory supply
        const updatedInventorySupply = await connection.model<InventorySchema>(InventorySchema.name).findById(inventorySupply.id)
        expect(updatedInventorySupply.quantity).toBe(4)
        expect(updatedPlacedItem.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
