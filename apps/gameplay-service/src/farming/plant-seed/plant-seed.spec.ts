// npx jest apps/gameplay-service/src/farming/plant-seed/plant-seed.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { PlantSeedService } from "./plant-seed.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import {
    SeedGrowthInfoEntity,
    CropEntity,
    PlacedItemEntity,
    InventoryEntity,
    UserSchema,
    SystemEntity,
    SystemId,
    Activities,
    getPostgreSqlToken,
    CropId,
    CropCurrentState,
    InventoryTypeId,
    PlacedItemTypeId,
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

describe("PlantSeedService", () => {
    let dataSource: DataSource
    let service: PlantSeedService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [PlantSeedService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(PlantSeedService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully plant a seed and update the user's stats and inventory accordingly", async () => {
        const quantity = 10

        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            water: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const cropId = CropId.Carrot
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: cropId }
        })
        const inventorySeed = await dataSource.manager.save(InventoryEntity, {
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: quantity,
            userId: user.id
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        // Call the service method to plant the seed
        await service.plantSeed({
            userId: user.id,
            inventorySeedId: inventorySeed.id,
            placedItemTileId: placedItemTile.id
        })

        const userAfter = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) - 
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Assert inventory quantity decreased by 1
        const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: { id: inventorySeed.id }
        })

        expect(updatedInventory.quantity).toBe(quantity - 1)

        // Assert seed growth info was created
        const seedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { placedItemId: placedItemTile.id }
        })

        expect(seedGrowthInfo).not.toBeNull()
        expect(seedGrowthInfo.cropId).toBe(cropId)
        expect(seedGrowthInfo.harvestQuantityRemaining).toBe(crop.maxHarvestQuantity)
        expect(seedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw GrpcNotFoundException when seed is not found in inventory", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        
        const invalidInventorySeedId = v4()

        await expect(
            service.plantSeed({
                userId: user.id,
                inventorySeedId: invalidInventorySeedId,
                placedItemTileId: v4()
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcNotFoundException when tile is not found", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const inventorySeed = await dataSource.manager.save(InventoryEntity, {
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 1,
            userId: user.id
        })
        const invalidPlacedItemTileId = v4()

        await expect(
            service.plantSeed({
                userId: user.id,
                inventorySeedId: inventorySeed.id,
                placedItemTileId: invalidPlacedItemTileId
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when tile is already planted", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const inventorySeed = await dataSource.manager.save(InventoryEntity, {
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 10,
            userId: user.id,
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                cropId: CropId.Carrot,
                currentState: CropCurrentState.Normal,
                harvestQuantityRemaining: 10
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        await expect(
            service.plantSeed({
                userId: user.id,
                inventorySeedId: inventorySeed.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            water: { energyConsume }
        } = value as Activities
        
        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const inventorySeed = await dataSource.manager.save(InventoryEntity, {
            inventoryTypeId: InventoryTypeId.CarrotSeed,
            quantity: 10,
            userId: user.id,
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        await expect(
            service.plantSeed({
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