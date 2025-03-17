// npx jest apps/gameplay-subgraph/src/mutations/farming/plant-seed/plant-seed.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { PlantSeedService } from "./plant-seed.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import { LevelService, StaticService } from "@src/gameplay"
import { v4 } from "uuid"
import { CropNotFoundException } from "@src/exceptions"
import { EnergyNotEnoughException } from "@src/exceptions"
import {
    getMongooseToken,
    CropSchema,
    PlacedItemSchema,
    InventorySchema,
    UserSchema,
    SeedGrowthInfoSchema,
    CropCurrentState,
    CropId,
    InventoryTypeId,
    PlacedItemTypeId,
} from "@src/databases"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

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

        service = module.get<PlantSeedService>(PlantSeedService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
        staticService = module.get<StaticService>(StaticService)
    })

    it("should successfully plant a seed and update the user's stats and inventory accordingly", async () => {
        const quantity = 10
        const { energyConsume, experiencesGain } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const cropId = CropId.Carrot
        const crop = await connection
            .model<CropSchema>(CropSchema.name)
            .findById(createObjectId(cropId))

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: quantity,
            userId: user.id
        })

        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                userId: user.id,
                placedItemTypeId: PlacedItemTypeId.BasicTile
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

        // Assert seed growth info was created
        const seedGrowthInfo = await connection
            .model<SeedGrowthInfoSchema>(SeedGrowthInfoSchema.name)
            .findOne({
                placedItemId: placedItemTile.id
            })

        expect(seedGrowthInfo).not.toBeNull()
        expect(seedGrowthInfo.crop).toBe(cropId)
        expect(seedGrowthInfo.harvestQuantityRemaining).toBe(crop.maxHarvestQuantity)
        expect(seedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw CropNotFoundException when seed is not found in inventory", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const invalidInventorySeedId = v4()

        await expect(
            service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: invalidInventorySeedId,
                    placedItemTileId: v4()
                }
            )
        ).rejects.toThrow(CropNotFoundException)
    })

    it("should throw CropNotFoundException when tile is not found", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 1,
            userId: user.id
        })
        const invalidPlacedItemTileId = v4()

        await expect(
            service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: inventorySeed.id,
                    placedItemTileId: invalidPlacedItemTileId
                }
            )
        ).rejects.toThrow(CropNotFoundException)
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { energyConsume } = staticService.activities.plantSeed

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const inventorySeed = await connection.model<InventorySchema>(InventorySchema.name).create({
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 10,
            userId: user.id
        })

        const placedItemTile = await connection
            .model<PlacedItemSchema>(PlacedItemSchema.name)
            .create({
                x: 0,
                y: 0,
                userId: user.id,
                placedItemTypeId: PlacedItemTypeId.BasicTile
            })

        await expect(
            service.plantSeed(
                {
                    id: user.id
                },
                {
                    inventorySeedId: inventorySeed.id,
                    placedItemTileId: placedItemTile.id
                }
            )
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
