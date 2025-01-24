// npx jest apps/gameplay-service/src/farming/harvest-crop/harvest-crop.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { HarvestCropService } from "./harvest-crop.service"
import {
    GameplayConnectionService,
    GameplayMockUserService,
    TestingInfraModule
} from "@src/testing"
import {
    SeedGrowthInfoEntity,
    CropCurrentState,
    PlacedItemEntity,
    UserEntity,
    InventoryEntity,
    SystemEntity,
    SystemId,
    Activities,
    getPostgreSqlToken,
    PlacedItemTypeId,
    CropId,
    TileInfoEntity
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

describe("HarvestCropService", () => {
    let dataSource: DataSource
    let service: HarvestCropService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HarvestCropService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(HarvestCropService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully harvest the one-season crop and update the user's stats and inventory accordingly (not quality)", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            collectAnimalProduct: { energyConsume, experiencesGain }
        } = value as Activities
    
        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const cropId = CropId.Carrot

        const quantity = 10
        // Create placed tile with a fully matured crop
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.FullyMatured,
                currentPerennialCount: 0,
                cropId,
                harvestQuantityRemaining: quantity,
                isQuality: false
            },
            tileInfo: {},
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.StarterTile,
            userId: user.id
        })

        // Call the service method to harvest the crop
        await service.harvestCrop({
            userId: user.id,
            placedItemTileId: placedItemTile.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) - 
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Assert inventory quantity increased by harvested amount
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    product: {
                        cropId
                    }
                }
            },
            relations: {
                inventoryType: {
                    product: true
                }
            }
        })

        expect(inventory.quantity).toBe(quantity)
        expect(inventory.inventoryType.product.isQuality).toBe(false)

        // Assert seed growth info is updated or removed
        const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { id: placedItemTile.seedGrowthInfo.id }
        })

        expect(updatedSeedGrowthInfo).toBeNull()

        const updatedTileInfo = await dataSource.manager.findOne(TileInfoEntity, {
            where: { id: placedItemTile.tileInfoId },
        })
        expect(updatedTileInfo.harvestCount).toBe(placedItemTile.tileInfo.harvestCount + 1)
    })

    it("should successfully harvest the one-season crop and update the user's stats and inventory accordingly (quality)", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            collectAnimalProduct: { energyConsume, experiencesGain }
        } = value as Activities
    
        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const cropId = CropId.Carrot

        const quantity = 10
        // Create placed tile with a fully matured crop
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.FullyMatured,
                currentPerennialCount: 0,
                cropId,
                harvestQuantityRemaining: quantity,
                isQuality: true
            },
            tileInfo: {},
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.StarterTile,
            userId: user.id
        })

        // Call the service method to harvest the crop
        await service.harvestCrop({
            userId: user.id,
            placedItemTileId: placedItemTile.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        // Assert energy and experience changes
        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) - 
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        // Assert inventory quantity increased by harvested amount
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    product: {
                        cropId
                    }
                }
            },
            relations: {
                inventoryType: {
                    product: true
                }
            }
        })

        expect(inventory.quantity).toBe(quantity)
        expect(inventory.inventoryType.product.isQuality).toBe(true)

        // Assert seed growth info is updated or removed
        const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { id: placedItemTile.seedGrowthInfo.id }
        })

        expect(updatedSeedGrowthInfo).toBeNull()

        const updatedTileInfo = await dataSource.manager.findOne(TileInfoEntity, {
            where: { id: placedItemTile.tileInfoId },
        })
        expect(updatedTileInfo.harvestCount).toBe(placedItemTile.tileInfo.harvestCount + 1)
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
            service.harvestCrop({
                userId: user.id,
                placedItemTileId: invalidPlacedItemTileId
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcNotFoundException when tile belongs to a different user", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.FullyMatured,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.StarterTile
        })

        await expect(
            service.harvestCrop({
                userId: v4(), // Different user ID
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when tile is not planted", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: null, // Not planted
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.StarterTile
        })

        await expect(
            service.harvestCrop({
                userId: user.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcFailedPreconditionException when crop is not fully matured", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            useFertilizer: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.Normal, // Not fully matured
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.StarterTile
        })

        await expect(
            service.harvestCrop({
                userId: user.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw EnergyNotEnoughException when user energy is not enough", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            water: { energyConsume }
        } = value as Activities
        
        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })
        
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.FullyMatured,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.StarterTile
        })
        
        await expect(
            service.harvestCrop({
                userId: user.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })
    
    afterEach(async () => {
        jest.clearAllMocks()
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
