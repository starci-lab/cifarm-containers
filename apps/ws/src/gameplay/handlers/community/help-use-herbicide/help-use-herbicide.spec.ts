// npx jest apps/ws/src/gameplay/handlers/community/help-use-herbicide/help-use-herbicide.spec.ts
import { Test } from "@nestjs/testing"
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { UseHerbicideService } from "../../farming/use-herbicide/use-herbicide.service"
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
import { EmitActionPayload } from "../../../emitter"
import { HelpUseHerbicideReasonCode } from "./types"

describe("HelpUseHerbicideService", () => {
    let service: HelpUseHerbicideService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    let useHerbicideService: UseHerbicideService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseHerbicideService, HelpUseHerbicideService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(HelpUseHerbicideService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        useHerbicideService = moduleRef.get(UseHerbicideService)
    })

    it("should successfully help use herbicide", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: neighbor.id,
            tileInfo: {},
            plantInfo: {
                crop: createObjectId(CropId.Turnip),
                currentStage: 3,
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
        // help use herbicide
        const { placedItems, action, watcherUserId } = await service.helpUseHerbicide(user, {
            placedItemTileId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.plantInfo.currentState).toBe(PlantCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
        expect(watcherUserId).toBe(neighbor.id.toString())
    })

    it("should throw error if user use herbicide before help", async () => {
        const user = await gameplayMockUserService.generate()
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: neighbor.id,
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
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: neighbor.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            kind: InventoryKind.Tool,
            index: 1,
        })
        let action: EmitActionPayload
        await Promise.all([
            useHerbicideService.useHerbicide(neighbor, {
                placedItemTileId: placedItemTile.id
            }),
            (async () => {
                // wait 10ms
                // await new Promise(resolve => setTimeout(resolve, 10))
                // help use herbicide
                try {
                    const { 
                        action: helpAction, 
                    } = await service.helpUseHerbicide(user, {
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
        expect(action.reasonCode).toBe(HelpUseHerbicideReasonCode.NotNeedHerbicide)
        //expect(placedItems.length).toBe(1)
        //expect(watcherUserId).toBe(neighbor.id.toString())
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
