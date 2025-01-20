// npx jest apps/gameplay-service/src/farming/use-fertilizer/use-fertilizer.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { UseFertilizerService } from "./use-fertilizer.service"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    SeedGrowthInfoEntity,
    SystemEntity,
    SupplyEntity,
    SupplyId,
    UserEntity,
    InventoryEntity,
    SystemId,
    Activities,
    PlacedItemEntity,
    CropId,
    PlacedItemTypeId,
    getPostgreSqlToken,
    InventoryTypeId
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"
import { GrpcFailedPreconditionException } from "@src/common"

describe("UseFertilizerService", () => {
    let service: UseFertilizerService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UseFertilizerService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(UseFertilizerService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should successfully use fertilizer on a tile and update user energy, experience, and tile state", async () => {
        const cropId = CropId.Carrot
        const supplyId = SupplyId.BasicFertilizer
        const quantity = 10

        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create a tile and seed growth info
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                isFertilized: false,
                currentStageTimeElapsed: 0,
                cropId,
                harvestQuantityRemaining: 10
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        const supplyFertilizer = await dataSource.manager.findOne(SupplyEntity, {
            where: { id: supplyId }
        })

        const inventoryFertilizer = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            quantity,
            inventoryTypeId: InventoryTypeId.BasicFertilizer
        })

        // Call the service to use fertilizer
        await service.useFertilizer({
            userId: user.id,
            placedItemTileId: placedItemTile.id,
            inventoryFertilizerId: inventoryFertilizer.id,
        })

        // Check if energy and experience were updated correctly
        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Check if the tile's seed growth info was updated
        const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { id: placedItemTile.seedGrowthInfo.id }
        })

        expect(updatedSeedGrowthInfo.isFertilized).toBe(true)
        expect(updatedSeedGrowthInfo.currentStageTimeElapsed).toBe(
            placedItemTile.seedGrowthInfo.currentStageTimeElapsed +
                supplyFertilizer.fertilizerEffectTimeReduce
        )
    })

    it("should throw GrpcNotFoundException when tile is not found by its ID", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const invalidPlacedItemTileId = v4()

        await expect(
            service.useFertilizer({
                userId: user.id,
                placedItemTileId: invalidPlacedItemTileId,
                inventoryFertilizerId: v4()
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcNotFoundException when seed growth info does not exist on tile", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const inventoryFertilizer = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            quantity: 10,
            inventoryTypeId: InventoryTypeId.BasicFertilizer
        })


        // Create a tile and seed growth info
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        await expect(
            service.useFertilizer({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                inventoryFertilizerId: inventoryFertilizer.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when tile is already fertilized", async () => {
        const cropId = CropId.Carrot

        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const inventoryFertilizer = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            quantity: 10,
            inventoryTypeId: InventoryTypeId.BasicFertilizer
        })


        // Create a tile and seed growth info
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                isFertilized: true,
                currentStageTimeElapsed: 0,
                cropId,
                harvestQuantityRemaining: 10
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        await expect(
            service.useFertilizer({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                inventoryFertilizerId: inventoryFertilizer.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcNotFoundException when fertilizer is not found in inventory", async () => {
        const cropId = CropId.Carrot
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        // Create a tile and seed growth info
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                isFertilized: false,
                currentStageTimeElapsed: 0,
                cropId,
                harvestQuantityRemaining: 10
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })

        await expect(
            service.useFertilizer({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                inventoryFertilizerId: v4()
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const cropId = CropId.Carrot

        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const inventoryFertilizer = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            quantity: 10,
            inventoryTypeId: InventoryTypeId.BasicFertilizer
        })

        // Create a tile and seed growth info
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                isFertilized: false,
                currentStageTimeElapsed: 0,
                cropId,
                harvestQuantityRemaining: 10
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1
        })
        await expect(
            service.useFertilizer({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                inventoryFertilizerId: inventoryFertilizer.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
