// npx jest apps/ws/src/gameplay/handlers/farming/use-bug-net/use-bug-net.spec.ts

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
import { EmitActionPayload } from "@apps/ws/src"
import { UseBugNetReasonCode } from "./types"
import { UseBugNetService } from "./use-bug-net.service"

describe("UseBugNetService", () => {
    let service: UseBugNetService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseBugNetService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(UseBugNetService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully use herbicide", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing

        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            fruitInfo: {
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
        // harvest 
        const { placedItems, action } = await service.useBugNet(user, {
            placedItemFruitId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
    })

    it("should throw error if use bug net 2 times", async () => {
        const user = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            fruitInfo: {
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
        let action: EmitActionPayload
        await Promise.all([
            service.useBugNet(user, {
                placedItemFruitId: placedItemTile.id
            }),
            (async () => {
                try {
                    const { 
                        action: useAction, 
                    } = await service.useBugNet(user, {
                        placedItemFruitId: placedItemTile.id
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
        expect(action.reasonCode).toBe(UseBugNetReasonCode.NotNeedBugNet)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
