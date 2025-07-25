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
import { EmitActionPayload } from "@apps/ws/src"
import { UseWateringCanReasonCode } from "./types"

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

    it("should throw error if use watering can 2 times", async () => {
        const user = await gameplayMockUserService.generate()
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
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,  
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            kind: InventoryKind.Tool,
            index: 1,
        })
        let action: EmitActionPayload
        await Promise.all([
            service.useWateringCan(user, {
                placedItemTileId: placedItemTile.id
            }),
            (async () => {
                try {
                    const { 
                        action: useAction, 
                    } = await service.useWateringCan(user, {
                        placedItemTileId: placedItemTile.id
                    })
                    action = useAction
                    console.log(useAction)
                } catch (error) {
                    console.log(error)
                }
            })()
        ])
        // check result
        expect(action.success).toBe(false)
        expect(action.reasonCode).toBe(UseWateringCanReasonCode.NotNeedWateringCan)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
