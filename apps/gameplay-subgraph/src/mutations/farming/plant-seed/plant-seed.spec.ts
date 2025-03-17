// npx jest apps/gameplay-service/src/farming/plant-seed/plant-seed.spec.ts

import { Test, TestingModule } from "@nestjs/testing"
import { PlantSeedService } from "./plant-seed.service"
import { GameplayConnectionService, GameplayMockUserService } from "@src/testing"
import { LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { CropNotFoundException } from "@src/exceptions"
import { EnergyNotEnoughException } from "@src/exceptions"
import { Activities, CropCurrentState, CropId, InventoryTypeId, PlacedItemTypeId, SystemId } from "@src/databases"
import { getMongooseToken, SystemSchema } from "@src/databases/mongoose"
import { Connection } from "mongoose"
import { createObjectId } from "@src/common"

describe("PlantSeedService", () => {
    let service: PlantSeedService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connection: Connection

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PlantSeedService,
                GameplayConnectionService,
                GameplayMockUserService,
                LevelService
            ]
        }).compile()

        service = module.get<PlantSeedService>(PlantSeedService)
        gameplayConnectionService = module.get<GameplayConnectionService>(GameplayConnectionService)
        gameplayMockUserService = module.get<GameplayMockUserService>(GameplayMockUserService)
        levelService = module.get<LevelService>(LevelService)
        connection = module.get<Connection>(getMongooseToken())
    })

    it("should successfully plant a seed and update the user's stats and inventory accordingly", async () => {
        const quantity = 10

        const system = await connection.model<SystemSchema>(SystemSchema.name).findById(createObjectId(SystemId.Activities))
        const { value } = system
        const {
            plantSeed: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const cropId = CropId.Carrot
        const crop = await cropModel.findOne({ id: cropId })
        
        const inventorySeed = await inventoryModel.create({
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: quantity,
            userId: user.id
        })

        const placedItemTile = await placedItemModel.create({
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile
        })

        // Call the service method to plant the seed
        await service.execute({
            userId: user.id,
            inventorySeedId: inventorySeed.id,
            placedItemTileId: placedItemTile.id
        })

        const userAfter = await userModel.findOne({ 
            id: user.id
        }).select("energy level experiences")

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) - 
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Assert inventory quantity decreased by 1
        const updatedInventory = await inventoryModel.findOne({
            id: inventorySeed.id
        })

        expect(updatedInventory.quantity).toBe(quantity - 1)

        // Assert seed growth info was created
        const seedGrowthInfo = await seedGrowthInfoModel.findOne({
            placedItemId: placedItemTile.id
        })

        expect(seedGrowthInfo).not.toBeNull()
        expect(seedGrowthInfo.cropId).toBe(cropId)
        expect(seedGrowthInfo.harvestQuantityRemaining).toBe(crop.maxHarvestQuantity)
        expect(seedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw CropNotFoundException when seed is not found in inventory", async () => {
        const system = await systemModel.findOne({ id: SystemId.Activities })
        const { value } = system
        const {
            plantSeed: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        
        const invalidInventorySeedId = v4()

        await expect(
            service.execute({
                userId: user.id,
                inventorySeedId: invalidInventorySeedId,
                placedItemTileId: v4()
            })
        ).rejects.toThrow(CropNotFoundException)
    })

    it("should throw CropNotFoundException when tile is not found", async () => {
        const system = await systemModel.findOne({ id: SystemId.Activities })
        const { value } = system
        const {
            plantSeed: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const inventorySeed = await inventoryModel.create({
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 1,
            userId: user.id
        })
        const invalidPlacedItemTileId = v4()

        await expect(
            service.execute({
                userId: user.id,
                inventorySeedId: inventorySeed.id,
                placedItemTileId: invalidPlacedItemTileId
            })
        ).rejects.toThrow(CropNotFoundException)
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const system = await systemModel.findOne({ id: SystemId.Activities })
        const { value } = system
        const {
            plantSeed: { energyConsume }
        } = value as Activities
        
        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const inventorySeed = await inventoryModel.create({
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 10,
            userId: user.id,
        })

        const placedItemTile = await placedItemModel.create({
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile
        })

        await expect(
            service.execute({
                userId: user.id,
                inventorySeedId: inventorySeed.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})