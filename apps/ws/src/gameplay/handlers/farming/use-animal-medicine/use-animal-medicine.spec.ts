// npx jest apps/ws/src/gameplay/handlers/farming/use-animal-medicine/use-animal-medicine.spec.ts

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
import { EmitActionPayload } from "@apps/ws/src"
import { UseAnimalMedicineReasonCode } from "./types"
import { UseAnimalMedicineService } from "./use-animal-medicine.service"

describe("UseAnimalMedicineService", () => {
    let service: UseAnimalMedicineService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseAnimalMedicineService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(UseAnimalMedicineService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully use pesticide", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing

        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            animalInfo: {
                currentState: AnimalCurrentState.Sick,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.Chicken)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
            kind: InventoryKind.Tool,
            index: 0,
        })  
        // harvest 
        const { placedItems, action } = await service.useAnimalMedicine(user, {
            placedItemAnimalId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findById(placedItemTile.id)
        expect(updatedPlacedItem.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
    })

    it("should throw error if use pesticide 2 times", async () => {
        const user = await gameplayMockUserService.generate()
        const placedItemTile = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            animalInfo: {
                currentState: AnimalCurrentState.Sick,
            },
            x: 0,
            y: 0,
            placedItemType: createObjectId(PlacedItemTypeId.Chicken)
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
            kind: InventoryKind.Tool,
            index: 0,
        })
        let action: EmitActionPayload
        await Promise.all([
            service.useAnimalMedicine(user, {
                placedItemAnimalId: placedItemTile.id
            }),
            (async () => {
                try {
                    const { 
                        action: useAction, 
                    } = await service.useAnimalMedicine(user, {
                        placedItemAnimalId: placedItemTile.id
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
        expect(action.reasonCode).toBe(UseAnimalMedicineReasonCode.NotNeedAnimalMedicine)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
