// npx jest apps/gameplay-service/src/community/thief-crop/thief-crop.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    AnimalCurrentState,
    PlacedItemEntity,
    InventoryEntity,
    UserEntity,
    getPostgreSqlToken,
    ProductType,
    PlacedItemTypeId,
    SystemEntity,
    SystemId,
    Activities,
    InventoryType,

    CropId,
    CropEntity,
    CropCurrentState,
    SeedGrowthInfoEntity
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { v4 } from "uuid"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"
import { ThiefCropService } from "./thief-crop.service"

describe("TheifCropService", () => {
    let dataSource: DataSource
    let service: ThiefCropService
    let connectionService: ConnectionService
    let gameplayMockUserService: GameplayMockUserService
    let levelService: LevelService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ThiefCropService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(ThiefCropService)
        connectionService = moduleRef.get(ConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        levelService = moduleRef.get(LevelService)
    })

    it("should successfully thief crop and update inventory", async () => {
        const cropId = CropId.Carrot
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefCrop: { energyConsume, experiencesGain }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: cropId }
        })

        // create
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.FullyMatured,
                harvestQuantityRemaining: crop.maxHarvestQuantity,
                cropId
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.BasicTile3,
            userId: neighborUser.id
        })

        const { quantity: thiefQuantity } = await service.thiefCrop({
            userId: user.id,
            placedItemTileId: placedItemTile.id,
            neighborUserId: neighborUser.id
        })

        const userAfter = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"]
        })

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(
            levelService.computeTotalExperienceForLevel(userAfter) -
                levelService.computeTotalExperienceForLevel(user)
        ).toBe(experiencesGain)

        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryType: {
                    type: InventoryType.Product,
                    product: {
                        type: ProductType.Crop,
                        cropId
                    }
                }
            }
        })

        expect(inventory.quantity).toBeGreaterThanOrEqual(thiefQuantity)

        const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { id: placedItemTile.animalInfoId }
        })

        expect(updatedSeedGrowthInfo.harvestQuantityRemaining).toBe(crop.maxHarvestQuantity - thiefQuantity)
    })

    it("should throw GrpcNotFoundException when the tile is not found by its ID", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefCrop: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()
        const invalidPlacedItemTileId = v4()

        await expect(
            service.thiefCrop({
                userId: user.id,
                placedItemTileId: invalidPlacedItemTileId,
                neighborUserId: neighborUser.id
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw EnergyNotEnoughException when user energy is not enough", async () => {
        const cropId = CropId.Carrot
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefCrop: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1
        })

        const neighborUser = await gameplayMockUserService.generate()

        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: cropId }
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.FullyMatured,
                harvestQuantityRemaining: crop.maxHarvestQuantity,
                cropId
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
            userId: neighborUser.id,
        })

        await expect(
            service.thiefCrop({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                neighborUserId: neighborUser.id
            })
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    it("should throw GrpcNotFoundException when the crop belongs to yourself", async () => {
        const cropId = CropId.Carrot
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefCrop: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })

        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: cropId }
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            animalInfo: {
                currentState: AnimalCurrentState.Yield,
                harvestQuantityRemaining: crop.maxHarvestQuantity
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
            userId: user.id
        })

        await expect(
            service.thiefCrop({
                userId: user.id,
                neighborUserId: user.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcInvalidArgumentException)
    })

    it("should throw GrpcFailedPreconditionException when crop is not ready to harvest", async () => {
        const cropId = CropId.Carrot
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities }
        })
        const {
            thiefCrop: { energyConsume }
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1
        })
        const neighborUser = await gameplayMockUserService.generate()

        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: cropId }
        })

        // create
        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            seedGrowthInfo: {
                currentState: CropCurrentState.Normal,
                harvestQuantityRemaining: crop.maxHarvestQuantity,
                cropId
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.BasicTile3,
            userId: neighborUser.id
        })

        await expect(
            service.thiefCrop({
                userId: user.id,
                neighborUserId: neighborUser.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
