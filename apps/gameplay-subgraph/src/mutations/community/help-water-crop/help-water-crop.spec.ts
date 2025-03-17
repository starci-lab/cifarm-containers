// npx jest apps/gameplay-subgraph/src/mutations/community/help-water-crop/help-water-crop.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { 
    CropCurrentState, 
    getMongooseToken, 
    PlacedItemSchema, 
    UserSchema,
    PlacedItemTypeId,
    InventorySchema,
    InventoryKind,
    InventoryTypeId
} from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { HelpWaterCropService } from "./help-water-crop.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("HelpWaterCropService", () => {
    let connection: Connection
    let service: HelpWaterCropService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HelpWaterCropService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<HelpWaterCropService>(HelpWaterCropService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully help water crop and update user stats", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.NeedWater,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create watering can in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.WateringCan),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        // Call the service method to help water crop
        await service.helpWaterCrop(
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

        // Check if the crop's state was updated
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        expect(updatedPlacedItemTile.seedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw GraphQLError with code WATERING_CAN_NOT_FOUND when user has no watering can", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.NeedWater,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // No watering can is created in the user's inventory

        try {
            await service.helpWaterCrop(
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
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.WateringCan),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.helpWaterCrop(
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

    it("should throw GraphQLError with code CANNOT_HELP_SELF when tile belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.NeedWater,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create watering can in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.WateringCan),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpWaterCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_HELP_SELF")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_PLANTED when tile has no seed growth info", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with no seed growth info
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create watering can in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.WateringCan),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpWaterCrop(
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

    it("should throw GraphQLError with code TILE_NOT_NEED_WATER when crop does not need water", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a normal crop (not needing water)
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.Normal, // Not needing water
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create watering can in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.WateringCan),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpWaterCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_NEED_WATER")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpWater

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a crop that needs water
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.NeedWater,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create watering can in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.WateringCan),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpWaterCrop(
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
