// npx jest apps/gameplay-subgraph/src/mutations/farming/use-fertilizer/use-fertilizer.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { UseFertilizerService } from "./use-fertilizer.service"
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
    CropCurrentState,
    PlacedItemTypeId,
    InventoryType,
    SupplyType,
    InventoryKind
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("UseFertilizerService", () => {
    let service: UseFertilizerService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseFertilizerService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<UseFertilizerService>(UseFertilizerService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully use fertilizer on a tile and update user energy, experience, and tile state", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        // Create placed item with a growing crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.Normal,
                    isFertilized: false,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to use fertilizer
        await service.useFertilizer(
            { id: user.id },
            {
                inventorySupplyId: inventory.id,
                placedItemTileId: placedItemTile.id
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

        // Check if the tile's seed growth info was updated
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        expect(updatedPlacedItemTile.seedGrowthInfo.isFertilized).toBe(true)
    })

    it("should throw GraphQLError with code PLACED_ITEM_TILE_NOT_FOUND when tile is not found", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemTileId: invalidPlacedItemTileId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_TILE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_PLANTED when seed growth info does not exist on tile", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        // Create placed item without seed growth info
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: null, // No crop planted
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_PLANTED")
        }
    })

    it("should throw GraphQLError with code TILE_FULLY_MATURED when crop is fully matured", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.FullyMatured, // Fully matured
                    isFertilized: false,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_FULLY_MATURED")
        }
    })

    it("should throw GraphQLError with code TILE_ALREADY_FERTILIZED when tile is already fertilized", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        // Create placed item with an already fertilized crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.Normal,
                    isFertilized: true, // Already fertilized
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_ALREADY_FERTILIZED")
        }
    })

    it("should throw GraphQLError with code INVENTORY_NOT_FOUND when inventory is not found", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a growing crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.Normal,
                    isFertilized: false,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        const invalidInventoryId = createObjectId()

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: invalidInventoryId,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVENTORY_NOT_FOUND")
        }
    })

    it("should throw EnergyNotEnoughError when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        // Create placed item with a growing crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.Normal,
                    isFertilized: false,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(EnergyNotEnoughException)
        }
    })

    it("should throw GraphQLError with code CANNOT_USE_ON_OTHERS_TILE when trying to use fertilizer on another user's tile", async () => {
        const { energyConsume } = staticService.activities.useFertilizer

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a fertilizer supply
        const fertilizer = staticService.supplies.find((s) => s.type === SupplyType.Fertilizer)

        // Find the inventory type for this fertilizer
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.type === InventoryType.Supply &&
                it.supply &&
                it.supply.toString() === fertilizer.id.toString()
        )

        // Create inventory with fertilizer
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: inventoryType.id,
            quantity: 10,
            kind: InventoryKind.Tool,
            supply: fertilizer.id,
            index: 0
        })

        // Create placed item with a growing crop owned by another user
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.Normal,
                    isFertilized: false,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useFertilizer(
                { id: user.id },
                {
                    inventorySupplyId: inventory.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_USE_ON_OTHERS_TILE")
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
