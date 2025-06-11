// npx jest apps/ws/src/gameplay/handlers/farming/use-watering-can/use-watering-can.spec.ts

import { Test } from "@nestjs/testing"
import { UseWateringCanService } from "./use-watering-can.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { 
    CropId, 
    getMongooseToken,
    InventoryKind, 
    InventorySchema,
    InventoryTypeId, 
    PlacedItemSchema, 
    PlacedItemTypeId,
    PlantCurrentState, 
    PlantType 
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

describe("UseWateringCanService", () => {
    let service: UseWateringCanService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseWateringCanService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(UseWateringCanService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully use watering can", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing

        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            tileInfo: {},
            plantInfo: {
                crop: createObjectId(CropId.Turnip),
                currentStage: 2,
                plantType: PlantType.Crop,
                currentState: PlantCurrentState.NeedWater,
                harvestCount: 20,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            kind: InventoryKind.Tool,
            index: 0,
        })  
        // harvest 
        const { placedItems, action } = await service.useWateringCan(user, {
            placedItemTileId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.plantInfo.currentState).toBe(PlantCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
