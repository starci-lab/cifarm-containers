// npx jest apps/gameplay-subgraph/src/mutations/farming/use-pesticide/use-pesticide.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { UsePesticideService } from "./use-pesticide.service"
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
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("UsePesticideService", () => {
    let service: UsePesticideService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UsePesticideService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<UsePesticideService>(UsePesticideService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully use pesticide and update tile state, energy, and experience", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create pesticide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Pesticide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with an infested crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.IsInfested,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to use pesticide
        await service.usePesticide(
            { id: user.id },
            {
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

        // Check if the tile's seed growth info was updated
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        expect(updatedPlacedItemTile.seedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw GraphQLError with code PESTICIDE_NOT_FOUND_IN_TOOLBAR when user doesn't have pesticide", async () => {
        const { energyConsume } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with an infested crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.IsInfested,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.usePesticide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PESTICIDE_NOT_FOUND_IN_TOOLBAR")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_FOUND when tile is not found", async () => {
        const { energyConsume } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create pesticide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Pesticide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.usePesticide(
                { id: user.id },
                {
                    placedItemTileId: invalidPlacedItemTileId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_PLANTED when seed growth info does not exist on tile", async () => {
        const { energyConsume } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create pesticide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Pesticide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item without seed growth info
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.usePesticide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_PLANTED")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_INFESTED when tile is not infested", async () => {
        const { energyConsume } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create pesticide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Pesticide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a crop that is not infested
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.Normal, // Not infested
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.usePesticide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_INFESTED")
        }
    })

    it("should throw GraphQLError with code UNAUTHORIZED_PESTICIDE when trying to use pesticide on another user's tile", async () => {
        const { energyConsume } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create pesticide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Pesticide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with an infested crop owned by another user
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.IsInfested,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.usePesticide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("UNAUTHORIZED_PESTICIDE")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.usePesticide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create pesticide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Pesticide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with an infested crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    currentState: CropCurrentState.IsInfested,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.usePesticide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
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
