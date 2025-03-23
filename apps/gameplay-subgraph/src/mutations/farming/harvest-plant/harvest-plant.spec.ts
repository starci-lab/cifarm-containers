// npx jest apps/gameplay-subgraph/src/mutations/farming/harvest-crop/harvest-crop.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import {
    PlantCurrentState,
    getMongooseToken,
    InventorySchema,
    InventoryTypeId,
    PlacedItemSchema,
    UserSchema,
    InventoryKind,
    PlacedItemTypeId
} from "@src/databases"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { Connection } from "mongoose"
import { HarvestPlantService } from "./harvest-plant.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("HarvestCropService", () => {
    let connection: Connection
    let service: HarvestPlantService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HarvestCropService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<HarvestCropService>(HarvestCropService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
    })

    it("should successfully harvest the crop and update the user's stats and inventory accordingly (not quality)", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            (type) => type.displayId === InventoryTypeId.Crate
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find a crop in static data
        const crop = staticService.crops[0]
        const quantity = 10

        // Find product for the crop (non-quality) from static data
        const product = staticService.products.find(
            (p) => p.crop && p.crop.toString() === crop.id.toString() && p.isQuality === false
        )

        // Find inventory type for the product from static data
        const inventoryType = staticService.inventoryTypes.find(
            (it) => it.product && it.product.toString() === product.id.toString()
        )

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    crop: crop.id,
                    currentState: PlantCurrentState.FullyMatured,
                    harvestQuantityRemaining: quantity,
                    isQuality: false
                },
                x: 0,
                y: 0,
                tileInfo: {},
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to harvest the crop
        const result = await service.harvestCrop(
            { id: user.id },
            {
                placedItemTileId: placedItemTile.id
            }
        )

        // Check the result
        expect(result.quantity).toBe(quantity)

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

        // Check if inventory was created with the harvested crop
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: inventoryType.id
        })

        expect(inventory).not.toBeNull()
        expect(inventory.quantity).toBe(quantity)

        // Check if the crop's state was updated
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        // For one-season crops, cropInfo should be removed
        expect(updatedPlacedItemTile.plantInfo).toBeUndefined()
    })

    it("should successfully harvest the crop and update the user's stats and inventory accordingly (quality)", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            (type) => type.displayId === InventoryTypeId.Crate
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find a crop in static data
        const crop = staticService.crops[0]
        const quantity = 10

        // Find product for the crop (quality) from static data
        const product = staticService.products.find(
            (p) => p.crop && p.crop.toString() === crop.id.toString() && p.isQuality === true
        )

        // Find inventory type for the product from static data
        const inventoryType = staticService.inventoryTypes.find(
            (it) =>
                it.product &&
                it.product.toString() === product.id.toString()
        )

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    crop: crop.id,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: quantity,
                    isQuality: true
                },
                x: 0,
                y: 0,
                user: user.id,
                tileInfo: {},
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to harvest the crop
        const result = await service.harvestCrop(
            { id: user.id },
            {
                placedItemTileId: placedItemTile.id
            }
        )

        // Check the result
        expect(result.quantity).toBe(quantity)

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

        // Check if inventory was created with the harvested crop
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: inventoryType.id
        })

        expect(inventory).not.toBeNull()
        expect(inventory.quantity).toBe(quantity)

        // Check if the crop's state was updated
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        // For one-season crops, cropInfo should be removed
        expect(updatedPlacedItemTile.plantInfo).toBeUndefined()
    })

    it("should throw GraphQLError with code CRATE_NOT_FOUND_IN_TOOLBAR when crate is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Note: We intentionally do NOT create a crate inventory for this test

        // Find a crop in static data
        const crop = staticService.crops[0]

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    crop: crop.id,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.harvestCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CRATE_NOT_FOUND_IN_TOOLBAR")
        }
    })

    it("should throw GraphQLError with code PLACED_ITEM_TILE_NOT_FOUND when tile is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            (type) => type.displayId === InventoryTypeId.Crate
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.harvestCrop(
                { id: user.id },
                {
                    placedItemTileId: invalidPlacedItemTileId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("PLACED_ITEM_TILE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_IS_NOT_PLANTED when tile is not planted", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            (type) => type.displayId === InventoryTypeId.Crate
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Create placed item with no crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.harvestCrop(
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

    it("should throw GraphQLError with code CROP_IS_NOT_FULLY_MATURED when crop is not fully matured", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            (type) => type.displayId === InventoryTypeId.Crate
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find a crop in static data
        const crop = staticService.crops[0]

        // Create placed item with a crop that is not fully matured
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    crop: crop.id,
                    currentState: CropCurrentState.Normal, // Not fully matured
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.harvestCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CROP_IS_NOT_FULLY_MATURED")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.harvestCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })

        // Create crate inventory
        const crateInventoryType = staticService.inventoryTypes.find(
            (type) => type.displayId === InventoryTypeId.Crate
        )

        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: crateInventoryType.id,
            quantity: 1,
            kind: InventoryKind.Tool,
            index: 0
        })

        // Find a crop in static data
        const crop = staticService.crops[0]

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                cropInfo: {
                    crop: crop.id,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false
                },
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.harvestCrop(
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
