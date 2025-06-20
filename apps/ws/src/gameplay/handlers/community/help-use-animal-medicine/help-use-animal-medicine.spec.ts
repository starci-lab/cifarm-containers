// npx jest apps/ws/src/gameplay/handlers/community/help-use-animal-medicine/help-use-animal-medicine.spec.ts
import { Test } from "@nestjs/testing"
import { HelpUseAnimalMedicineService } from "./help-use-animal-medicine.service"
import { UseAnimalMedicineService } from "../../farming/use-animal-medicine/use-animal-medicine.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import {
    getMongooseToken,
    InventoryKind,
    InventorySchema,
    InventoryTypeId,
    PlacedItemSchema,
    PlacedItemTypeId,
    AnimalCurrentState
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { EmitActionPayload } from "../../../emitter"

describe("HelpUseAnimalMedicineService", () => {
    let service: HelpUseAnimalMedicineService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService
    let useAnimalMedicineService: UseAnimalMedicineService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseAnimalMedicineService, HelpUseAnimalMedicineService]
        }).compile()
        const app = moduleRef.createNestApplication()
        await app.init()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(HelpUseAnimalMedicineService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        useAnimalMedicineService = moduleRef.get(UseAnimalMedicineService)
    })

    it("should successfully help use animal medicine", async () => {
        const user = await gameplayMockUserService.generate() // Generate a user for testing
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                user: neighbor.id,
                tileInfo: {},
                animalInfo: {
                    currentState: AnimalCurrentState.Sick
                },
                x: 0,
                y: 0,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
            kind: InventoryKind.Tool,
            index: 0
        })
        // help use animal medicine
        const { placedItems, action, watcherUserId } = await service.helpUseAnimalMedicine(user, {
            placedItemAnimalId: placedItemTile.id
        })
        // check result
        const updatedPlacedItem = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)
        expect(updatedPlacedItem.animalInfo.currentState).toBe(AnimalCurrentState.Normal)
        expect(action.success).toBe(true)
        expect(placedItems.length).toBe(1)
        expect(watcherUserId).toBe(neighbor.id.toString())
    })

    it("should throw error if user use animal medicine before help", async () => {
        const user = await gameplayMockUserService.generate()
        const neighbor = await gameplayMockUserService.generate()
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                user: neighbor.id,
                tileInfo: {},
                animalInfo: {
                    currentState: AnimalCurrentState.Sick
                },
                x: 0,
                y: 0,
                placedItemType: createObjectId(PlacedItemTypeId.Chicken)
            })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
            kind: InventoryKind.Tool,
            index: 0
        })
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: neighbor.id,
            inventoryType: createObjectId(InventoryTypeId.AnimalMedicine),
            kind: InventoryKind.Tool,
            index: 1
        })
        let action: EmitActionPayload
        await Promise.all([
            useAnimalMedicineService.useAnimalMedicine(neighbor, {
                placedItemAnimalId: placedItemTile.id
            }),
            (async () => {
                // help use animal medicine
                try {
                    const { action: helpAction } = await service.helpUseAnimalMedicine(user, {
                        placedItemAnimalId: placedItemTile.id
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
        expect(action.error).toBe("Animal is not sick")
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
