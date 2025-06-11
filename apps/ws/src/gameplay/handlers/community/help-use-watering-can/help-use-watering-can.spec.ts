// npx jest apps/ws/src/gameplay/handlers/community/help-use-watering-can/help-use-watering-can.spec.ts

import { Test } from "@nestjs/testing"
import { HelpUseWateringCanService } from "./help-use-watering-can.service"
import { UseWateringCanService } from "../../farming/use-watering-can/use-watering-can.service"
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
import { EmitActionPayload, HelpUseWateringCanReasonCode } from "../../../emitter"

describe("HelpUseWateringCanService", () => {
    let service: HelpUseWateringCanService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    let useWateringCanService: UseWateringCanService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseWateringCanService, HelpUseWateringCanService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(HelpUseWateringCanService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        useWateringCanService = moduleRef.get(UseWateringCanService)
    })

    it("should successfully help use watering can", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: neighbor.id,
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
        // help use watering can
        const { placedItems, action, watcherUserId } = await service.helpUseWateringCan(user, {
            placedItemTileId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.plantInfo.currentState).toBe(PlantCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
        expect(watcherUserId).toBe(neighbor.id.toString())
    })

    it("should throw error if user water before help", async () => {
        const user = await gameplayMockUserService.generate()
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: neighbor.id,
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
            user: neighbor.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            kind: InventoryKind.Tool,
            index: 1,
        })
        let action: EmitActionPayload
        await Promise.all([
            useWateringCanService.useWateringCan(neighbor, {
                placedItemTileId: placedItemTile.id
            }),
            (async () => {
                // wait 10ms
                // await new Promise(resolve => setTimeout(resolve, 10))
                // help use watering can
                try {
                    const { 
                        action: helpAction, 
                    } = await service.helpUseWateringCan(user, {
                        placedItemTileId: placedItemTile.id
                    })
                    action = helpAction
                    console.log(helpAction)
                } catch (error) {
                    console.log(error)
                }
            })()
        ])
        // check result
        expect(action.success).toBe(false)
        expect(action.reasonCode).toBe(HelpUseWateringCanReasonCode.NotNeedWater)
        //expect(placedItems.length).toBe(1)
        //expect(watcherUserId).toBe(neighbor.id.toString())
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
