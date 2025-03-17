// npx jest apps/gameplay-subgraph/src/mutations/community/help-use-herbicide/help-use-herbicide.spec.ts

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
import { HelpUseHerbicideService } from "./help-use-herbicide.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("HelpUseHerbicideService", () => {
    let connection: Connection
    let service: HelpUseHerbicideService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HelpUseHerbicideService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<HelpUseHerbicideService>(HelpUseHerbicideService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully help use herbicide on weedy crop and update user stats", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.helpUseHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.IsWeedy,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create herbicide in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.Herbicide),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        // Call the service method to help use herbicide
        await service.helpUseHerbicide(
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

    it("should throw GraphQLError with code HERBICIDE_NOT_FOUND when user has no herbicide", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.IsWeedy,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // No herbicide is created in the user's inventory

        try {
            await service.helpUseHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("HERBICIDE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_FOUND when tile is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create herbicide in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.Herbicide),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.helpUseHerbicide(
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

    it("should throw GraphQLError with code CANNOT_USE_HERBICIDE_ON_OWN_TILE when tile belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.IsWeedy,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create herbicide in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.Herbicide),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_USE_HERBICIDE_ON_OWN_TILE")
        }
    })

    it("should throw GraphQLError with code TILE_IS_NOT_PLANTED when tile has no seed growth info", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseHerbicide

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

        // Create herbicide in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.Herbicide),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_IS_NOT_PLANTED")
        }
    })

    it("should throw GraphQLError with code TILE_DOES_NOT_NEED_HERBICIDE when crop is not weedy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a normal crop (not weedy)
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.Normal, // Not weedy
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create herbicide in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.Herbicide),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseHerbicide(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_DOES_NOT_NEED_HERBICIDE")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.helpUseHerbicide

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item with a weedy crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: createObjectId(),
                    currentState: CropCurrentState.IsWeedy,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create herbicide in user's inventory
        await connection
            .model<InventorySchema>(InventorySchema.name)
            .create({
                user: user.id,
                inventoryType: createObjectId(InventoryTypeId.Herbicide),
                kind: InventoryKind.Tool,
                quantity: 1,
                index: 0
            })

        try {
            await service.helpUseHerbicide(
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
