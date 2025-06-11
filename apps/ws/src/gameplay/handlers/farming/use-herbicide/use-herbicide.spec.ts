// npx jest apps/ws/src/gameplay/handlers/farming/use-herbicide/use-herbicide.spec.ts

import { Test } from "@nestjs/testing"
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
import { UseHerbicideReasonCode } from "./types"
import { UseHerbicideService } from "./use-herbicide.service"

describe("UseHerbicideService", () => {
    let service: UseHerbicideService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseHerbicideService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(UseHerbicideService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully use herbicide", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing

        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            tileInfo: {},
            plantInfo: {
                crop: createObjectId(CropId.Turnip),
                currentStage: 2,
                plantType: PlantType.Crop,
                currentState: PlantCurrentState.IsWeedy,
                harvestCount: 20,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            kind: InventoryKind.Tool,
            index: 0,
        })  
        // harvest 
        const { placedItems, action } = await service.useHerbicide(user, {
            placedItemTileId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.plantInfo.currentState).toBe(PlantCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
    })

    it("should throw error if use herbicide 2 times", async () => {
        const user = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            tileInfo: {},
            plantInfo: {
                crop: createObjectId(CropId.Turnip),
                currentStage: 2,
                plantType: PlantType.Crop,
                currentState: PlantCurrentState.IsWeedy,
                harvestCount: 20,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            kind: InventoryKind.Tool,
            index: 0,
        })
        let action: EmitActionPayload
        await Promise.all([
            service.useHerbicide(user, {
                placedItemTileId: placedItemTile.id
            }),
            (async () => {
                try {
                    const { 
                        action: useAction, 
                    } = await service.useHerbicide(user, {
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
        expect(action.reasonCode).toBe(UseHerbicideReasonCode.NotNeedHerbicide)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
