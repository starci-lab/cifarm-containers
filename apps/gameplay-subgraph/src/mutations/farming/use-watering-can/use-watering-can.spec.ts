// npx jest apps/gameplay-subgraph/src/mutations/farming/water-crop/water-crop.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { UseWateringCanService } from "./use-watering-can.service"
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
    PlacedItemTypeId,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("UseWateringCanService", () => {
    let service: UseWateringCanService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseWateringCanService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<UseWateringCanService>(UseWateringCanService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully water a crop and update user energy, experience, and tile state", async () => {
        const { energyConsume, experiencesGain } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.NeedWater,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to water the crop
        await service.water(
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

    it("should throw GraphQLError with code WATERING_CAN_NOT_FOUND when user doesn't have a watering can", async () => {
        const { energyConsume } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.NeedWater,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.water(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("WATERING_CAN_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_FOUND when tile is not found", async () => {
        const { energyConsume } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.water(
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
        const { energyConsume } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
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
            await service.water(
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

    it("should throw GraphQLError with code TILE_DOES_NOT_NEED_WATER when tile does not need water", async () => {
        const { energyConsume } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a crop that doesn't need water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.Normal, // Not needing water
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.water(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_DOES_NOT_NEED_WATER")
        }
    })

    it("should throw GraphQLError with code UNAUTHORIZED_WATERING when trying to water another user's tile", async () => {
        const { energyConsume } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const otherUser = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a crop that needs water owned by another user
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.NeedWater,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: otherUser.id, // Different user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.water(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("UNAUTHORIZED_WATERING")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.waterCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create watering can inventory for the user
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.WateringCan),
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    currentState: CropCurrentState.NeedWater,
                    currentStageTimeElapsed: 0,
                    harvestQuantityRemaining: 10
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.water(
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
