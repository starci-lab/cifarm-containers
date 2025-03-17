// npx jest apps/gameplay-subgraph/src/mutations/farming/plant-seed/plant-seed.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { PlantSeedService } from "./plant-seed.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { LevelService, StaticService } from "@src/gameplay"
import {
    getMongooseToken,
    PlacedItemSchema,
    InventorySchema,
    UserSchema,
    CropCurrentState,
    CropId,
    InventoryTypeId,
    PlacedItemTypeId,
    InventoryKind,
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"
import { GraphQLError } from "graphql"

describe("PlantSeedService", () => {
    let service: PlantSeedService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection
    let staticService: StaticService

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [PlantSeedService]
        }).compile()
        
        staticService = module.get<StaticService>(StaticService)
        await staticService.onModuleInit()
        service = module.get<PlantSeedService>(PlantSeedService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    // Helper function to create a watering can inventory for a user
    async function createWateringCanInventory(userId: string) {
        const inventoryTypeWateringCan = staticService.inventoryTypes.find(
            (inventoryType) => inventoryType.displayId === InventoryTypeId.WateringCan
        )
        
        return await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: inventoryTypeWateringCan.id,
            index: 1,
            quantity: 1,
            user: userId,
            kind: InventoryKind.Storage
        })
    }

    it("should successfully plant a seed and update the user's stats and inventory accordingly", async () => {
        const quantity = 10
        const { energyConsume, experiencesGain } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await createWateringCanInventory(user.id)

        const cropId = CropId.Carrot
        const crop = staticService.crops.find(c => c.displayId === cropId)

        // Get the inventory type for carrot seed from static service
        const inventoryTypeSeed = staticService.inventoryTypes.find(
            (inventoryType) => inventoryType.displayId === InventoryTypeId.CarrotSeed
        )

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: inventoryTypeSeed.id,
            index: 0,
            quantity,
            user: user.id,
            kind: InventoryKind.Storage
        })

        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        // Call the service method to plant the seed
        await service.plantSeed(
            {
                id: user.id
            },
            {
                inventorySeedId: inventorySeed.id,
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

        // Assert inventory quantity decreased by 1
        const updatedInventory = await connection
            .model<InventorySchema>(InventorySchema.name)
            .findById(inventorySeed.id)

        expect(updatedInventory.quantity).toBe(quantity - 1)

        // Get the updated placedItemTile
        const updatedPlacedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .findById(placedItemTile.id)

        expect(updatedPlacedItemTile.seedGrowthInfo).not.toBeNull()
        expect(updatedPlacedItemTile.seedGrowthInfo.crop.toString()).toBe(crop.id.toString())
        expect(updatedPlacedItemTile.seedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw GraphQLError with code WATERING_CAN_NOT_FOUND when user doesn't have a watering can", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Get the inventory type for carrot seed from static service
        const inventoryTypeSeed = staticService.inventoryTypes.find(
            (inventoryType) => inventoryType.displayId === InventoryTypeId.CarrotSeed
        )

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: inventoryTypeSeed.id,
            index: 0,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Storage
        })

        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: inventorySeed.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("WATERING_CAN_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code INVENTORY_NOT_FOUND when seed is not found in inventory", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await createWateringCanInventory(user.id)

        const invalidInventorySeedId = createObjectId()

        try {
            await service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: invalidInventorySeedId,
                    placedItemTileId: createObjectId()
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("INVENTORY_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code TILE_NOT_FOUND when tile is not found", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create watering can inventory for the user
        await createWateringCanInventory(user.id)

        // Get the inventory type for carrot seed from static service
        const inventoryTypeSeed = staticService.inventoryTypes.find(
            (inventoryType) => inventoryType.displayId === InventoryTypeId.CarrotSeed
        )

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: inventoryTypeSeed.id,
            index: 0,
            quantity: 1,
            user: user.id,
            kind: InventoryKind.Storage
        })
        const invalidPlacedItemTileId = createObjectId()

        try {
            await service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: inventorySeed.id,
                    placedItemTileId: invalidPlacedItemTileId
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("TILE_NOT_FOUND")
        }
    })

    it("should throw GraphQLError with code ENERGY_NOT_ENOUGH when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        // Create watering can inventory for the user
        await createWateringCanInventory(user.id)

        // Get the inventory type for carrot seed from static service
        const inventoryTypeSeed = staticService.inventoryTypes.find(
            (inventoryType) => inventoryType.displayId === InventoryTypeId.CarrotSeed
        )

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryType: inventoryTypeSeed.id,
            index: 0,
            quantity: 10,
            user: user.id,
            kind: InventoryKind.Storage
        })

        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                user: user.id,
                placedItemType: createObjectId(PlacedItemTypeId.BasicTile)
            })

        try {
            await service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: inventorySeed.id,
                    placedItemTileId: placedItemTile.id
                }
            )
            fail("Expected error to be thrown")
        } catch (error) {
            expect(error).toBeInstanceOf(GraphQLError)
            expect(error.extensions.code).toBe("ENERGY_NOT_ENOUGH")
        }
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
