// npx jest apps/ws/src/gameplay/handlers/farming/use-fruit-fertilizer/use-fruit-fertilizer.spec.ts

import { Test } from "@nestjs/testing"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { 
    FruitCurrentState, 
    getMongooseToken,
    InventoryKind, 
    InventorySchema,
    InventoryTypeId, 
    PlacedItemSchema, 
    PlacedItemTypeId,
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"

describe("UseFruitFertilizerService", () => {
    let service: UseFruitFertilizerService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseFruitFertilizerService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(UseFruitFertilizerService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully use herbicide", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing

        const placedItemFruit = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            fruitInfo: {
                currentState: FruitCurrentState.NeedFertilizer,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })
        const inventorySupply = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.FruitFertilizer),
            kind: InventoryKind.Tool,
            quantity: 5,
            index: 0,
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.FruitFertilizer),
            kind: InventoryKind.Tool,
            index: 0,
        })  
        // harvest 
        const { placedItems, action } = await service.useFruitFertilizer(user, {
            placedItemFruitId: placedItemFruit.id,
            inventorySupplyId: inventorySupply.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemFruit.id)
        const updatedInventorySupply = await connection.model<InventorySchema>(InventorySchema.name).findById(inventorySupply.id)
        expect(updatedInventorySupply.quantity).toBe(4)
        expect(updatedPlacedItem.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
