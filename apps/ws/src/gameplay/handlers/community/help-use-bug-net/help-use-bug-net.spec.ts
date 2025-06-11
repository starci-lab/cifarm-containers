// npx jest apps/ws/src/gameplay/handlers/community/help-use-bug-net/help-use-bug-net.spec.ts
import { Test } from "@nestjs/testing"
import { HelpUseBugNetService } from "./help-use-bug-net.service"
import { UseBugNetService } from "../../farming/use-bug-net/use-bug-net.service"
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
import { EmitActionPayload } from "../../../emitter"
import { HelpUseBugNetReasonCode } from "./types"

describe("HelpUseBugNetService", () => {
    let service: HelpUseBugNetService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    let useBugNetService: UseBugNetService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseBugNetService, HelpUseBugNetService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(HelpUseBugNetService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        useBugNetService = moduleRef.get(UseBugNetService)
    })

    it("should successfully help use bug net", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: neighbor.id,
            tileInfo: {},
            fruitInfo: {
                currentStage: 3,
                currentState: FruitCurrentState.IsBuggy,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.Apple)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.BugNet),
            kind: InventoryKind.Tool,
            index: 0,
        })  
        // help use bug net
        const { placedItems, action, watcherUserId } = await service.helpUseBugNet(user, {
            placedItemFruitId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
        expect(watcherUserId).toBe(neighbor.id.toString())
    })

    it("should throw error if user use bug net before help", async () => {
        const user = await gameplayMockUserService.generate()
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: neighbor.id,
            tileInfo: {},
            fruitInfo: {
                currentStage: 3,
                currentState: FruitCurrentState.IsBuggy,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.Apple)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.BugNet),
            kind: InventoryKind.Tool,
            index: 0,
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: neighbor.id,
            inventoryType: createObjectId(InventoryTypeId.BugNet),
            kind: InventoryKind.Tool,
            index: 1,
        })
        let action: EmitActionPayload
        await Promise.all([
            useBugNetService.useBugNet(neighbor, {
                placedItemFruitId: placedItemTile.id
            }),
            (async () => {
                // wait 10ms
                // await new Promise(resolve => setTimeout(resolve, 10))
                // help use bug net
                try {
                    const { 
                        action: helpAction, 
                    } = await service.helpUseBugNet(user, {
                        placedItemFruitId: placedItemTile.id
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
        expect(action.reasonCode).toBe(HelpUseBugNetReasonCode.NotNeedBugNet)
        //expect(placedItems.length).toBe(1)
        //expect(watcherUserId).toBe(neighbor.id.toString())
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
