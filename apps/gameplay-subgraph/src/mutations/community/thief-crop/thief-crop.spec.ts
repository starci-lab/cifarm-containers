// npx jest apps/gameplay-subgraph/src/mutations/community/thief-crop/thief-crop.spec.ts

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
    InventoryTypeId,
    ProductType
} from "@src/databases"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { Connection } from "mongoose"
import { ThiefCropService } from "./thief-crop.service"
import { GraphQLError } from "graphql"
import { LevelService, StaticService, ThiefService } from "@src/gameplay"
import { EnergyNotEnoughException } from "@src/gameplay"

describe("ThiefCropService", () => {
    let connection: Connection
    let service: ThiefCropService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let staticService: StaticService
    let thiefService: ThiefService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ThiefCropService]
        }).compile()

        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        connection = module.get<Connection>(getMongooseToken())
        service = module.get<ThiefCropService>(ThiefCropService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        thiefService = module.get<ThiefService>(ThiefService)
    })

    it("should successfully thief crop and update inventory", async () => {
        // Get activity data from system
        const { energyConsume, experiencesGain } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 20,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        // Mock the thiefService.compute method to return a predictable value
        jest.spyOn(thiefService, "compute").mockReturnValueOnce({ value: 3 })

        // Call the service method to thief crop
        const result = await service.thiefCrop(
            { id: user.id },
            {
                placedItemTileId: placedItemTile.id
            }
        )

        // Check the result
        expect(result.quantity).toBe(3)

        // Check user energy and experience changes
        const userAfter = await connection
            .model<UserSchema>(UserSchema.name)
            .findById(user.id)
            .select("energy level experiences")

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Check if the crop's harvest quantity was reduced
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        expect(updatedPlacedItemTile.seedGrowthInfo.harvestQuantityRemaining).toBe(17) // 20 - 3
        expect(
            updatedPlacedItemTile.seedGrowthInfo.thieves.map((thief) => thief.toString())
        ).toContainEqual(user.id)

        // Find the product and inventory type for this crop
        const product = staticService.products.find(
            (product) =>
                product.type === ProductType.Crop && product.crop.toString() === cropId.toString()
        )
        const inventoryType = staticService.inventoryTypes.find(
            (it) => it.product.toString() === product.id
        )

        // Check if the product was added to the user's inventory
        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: inventoryType.id
        })

        expect(inventory).toBeTruthy()
        expect(inventory.quantity).toBe(3)
    })

    it("should throw GraphQLError with code CRATE_NOT_FOUND when user has no crate", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // No crate is created in the user's inventory

        try {
            await service.thiefCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CRATE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_FOUND when tile is not found", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.thiefCrop(
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

    it("should throw GraphQLError with code CANNOT_THIEF_FROM_YOUR_OWN_TILE when tile belongs to yourself", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: user.id, // Same user
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("CANNOT_THIEF_FROM_YOUR_OWN_TILE")
        }
    })

    it("should throw GraphQLError with code TILE_IS_NOT_PLANTED when tile has no seed growth info", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Create placed item without seed growth info
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefCrop(
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
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a non-fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.Normal, // Not fully matured
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefCrop(
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

    it("should throw GraphQLError with code USER_ALREADY_THIEF when user already thief from this crop", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a fully matured crop that user already thief from
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: [user.id] // User already in thieves list
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("USER_ALREADY_THIEF")
        }
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1 // Not enough energy
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        try {
            await service.thiefCrop(
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

    it("should throw GraphQLError with code THIEF_QUANTITY_IS_LESS_THAN_MINIMUM_HARVEST_QUANTITY when computed quantity is 0", async () => {
        // Get activity data from system
        const { energyConsume } = staticService.activities.thiefCrop

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        // Find a crop in the static service
        const cropId = staticService.crops[0].id

        // Create placed item with a fully matured crop
        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                seedGrowthInfo: {
                    crop: cropId,
                    currentState: CropCurrentState.FullyMatured,
                    harvestQuantityRemaining: 10,
                    isQuality: false,
                    thieves: []
                },
                x: 0,
                y: 0,
                user: neighborUser.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Create crate in user's inventory
        await connection.model<InventorySchema>(InventorySchema.name).create({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.Crate),
            kind: InventoryKind.Tool,
            quantity: 1,
            index: 0
        })

        // Mock the thiefService.compute method to return 0
        jest.spyOn(thiefService, "compute").mockReturnValueOnce({ value: 0 })

        try {
            await service.thiefCrop(
                { id: user.id },
                {
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("THIEF_QUANTITY_IS_LESS_THAN_MINIMUM_HARVEST_QUANTITY")
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
