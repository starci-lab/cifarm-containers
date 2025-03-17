// npx jest apps/gameplay-subgraph/src/mutations/farming/use-fruit-fertilizer/use-fruit-fertilizer.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { UseFruitFertilizerService } from "./use-fruit-fertilizer.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import {
    getMongooseToken,
    PlacedItemSchema,
    InventorySchema,
    UserSchema,
    FruitCurrentState,
    PlacedItemTypeId,
    InventoryKind,
    InventoryType,
    InventoryTypeId
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("UseFruitFertilizerService", () => {
    let service: UseFruitFertilizerService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseFruitFertilizerService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<UseFruitFertilizerService>(UseFruitFertilizerService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully use fruit fertilizer and update fruit state, energy, and experience", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find fruit fertilizer inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.FruitFertilizer
        )

        // Create inventory with fruit fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a fruit that needs fertilizer
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.NeedFertilizer,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to use fruit fertilizer
        await service.useFruitFertilizer(
            { id: user.id },
            {
                inventorySupplyId: inventory.id,
                placedItemFruitId: placedItemFruit.id
            }
        )

        const userAfter = await connection
            .model<UserSchema>(UserSchema.name)
            .findById(user.id)
            .select("energy level experiences")

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Check if inventory was updated (fertilizer was consumed)
        const inventoryAfter = await connection
            .model<InventorySchema>(InventorySchema.name)
            .findById(inventory.id)

        expect(inventoryAfter.quantity).toBe(9)

        // Check if the fruit's info was updated
        const updatedPlacedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemFruit.id)

        expect(updatedPlacedItemFruit.fruitInfo.currentState).toBe(FruitCurrentState.Normal)
    })

    it("should throw GraphQLError with code INVENTORY_NOT_FOUND when inventory is not found", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a fruit that needs fertilizer
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.NeedFertilizer,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        const invalidInventoryId = createObjectId()

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: invalidInventoryId,
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVENTORY_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code PLACED_ITEM_FRUIT_NOT_FOUND when fruit is not found", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find fruit fertilizer inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.FruitFertilizer
        )

        // Create inventory with fruit fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemFruitId = createObjectId()

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: invalidPlacedItemFruitId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_FRUIT_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code NO_FRUIT_TREE when fruit info doesn't exist", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find fruit fertilizer inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.FruitFertilizer
        )

        // Create inventory with fruit fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create a placed item without fruit info
        const placedItemWithoutFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: placedItemWithoutFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("NO_FRUIT_TREE")
        }
    })

    it("should throw GraphQLError with code TILE_DOES_NOT_NEED_FERTILIZER when fruit doesn't need fertilizer", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find fruit fertilizer inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.FruitFertilizer
        )

        // Create inventory with fruit fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a fruit that doesn't need fertilizer
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.Normal, // Not needing fertilizer
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_DOES_NOT_NEED_FERTILIZER")
        }
    })

    it("should throw GraphQLError with code UNAUTHORIZED_FRUIT_FERTILIZER when trying to use fertilizer on another user's fruit", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find fruit fertilizer inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.FruitFertilizer
        )

        // Create inventory with fruit fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a fruit owned by another user
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.NeedFertilizer,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("UNAUTHORIZED_FRUIT_FERTILIZER")
        }
    })

    it("should throw GraphQLError with code INVALID_INVENTORY_TYPE when inventory type is not a supply", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a non-supply inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.type !== InventoryType.Supply
        )

        // Create inventory with invalid type
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a fruit that needs fertilizer
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.NeedFertilizer,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVALID_INVENTORY_TYPE")
        }
    })

    it("should throw GraphQLError with code INVALID_FERTILIZER_TYPE when inventory is not fruit fertilizer", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a supply inventory type that is not fruit fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            type => type.type === InventoryType.Supply && type.displayId !== InventoryTypeId.FruitFertilizer
        )

        // Create inventory with wrong fertilizer type
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a fruit that needs fertilizer
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.NeedFertilizer,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVALID_FERTILIZER_TYPE")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.useFruitFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Find fruit fertilizer inventory type
        const inventoryType = staticService.inventoryTypes.find(
            type => type.displayId === InventoryTypeId.FruitFertilizer
        )

        // Create inventory with fruit fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a fruit that needs fertilizer
        const placedItemFruit = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                fruitInfo: {
                    currentState: FruitCurrentState.NeedFertilizer,
                    fruit: createObjectId(),
                    harvestQuantityRemaining: 5
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFruitFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemFruitId: placedItemFruit.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(EnergyNotEnoughException)
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
