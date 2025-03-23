// npx jest apps/gameplay-subgraph/src/mutations/farming/use-herbicide/use-herbicide.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { UseHerbicideService } from "./use-herbicide.service"
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

describe("UseHerbicideService", () => {
    let service: UseHerbicideService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseHerbicideService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<UseHerbicideService>(UseHerbicideService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully use herbicide and update tile state, energy, and experience", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create herbicide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.IsWeedy,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to use herbicide
        await service.useHerbicide(
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

        expect(updatedPlacedItemTile.plantInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw GraphQLError with code HERBICIDE_NOT_FOUND when user doesn't have herbicide", async () => {
        const { energyConsume } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.IsWeedy,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("HERBICIDE_NOT_FOUND_IN_TOOLBAR")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_FOUND when tile is not found", async () => {
        const { energyConsume } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create herbicide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.useHerbicide(
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
        const { energyConsume } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create herbicide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
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
            await service.useHerbicide(
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

    it("should throw GraphQLError with code TILE_NOT_WEEDY when tile is not weedy", async () => {
        const { energyConsume } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create herbicide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a crop that is not weedy
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.Normal, // Not weedy
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_WEEDY")
        }
    })

    it("should throw GraphQLError with code UNAUTHORIZED_HERBICIDE when trying to use herbicide on another user's tile", async () => {
        const { energyConsume } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create herbicide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a weedy crop owned by another user
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.IsWeedy,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("UNAUTHORIZED_HERBICIDE")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.useHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create herbicide inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Herbicide),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.IsWeedy,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.useHerbicide(
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
