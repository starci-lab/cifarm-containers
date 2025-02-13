// npx jest apps/gameplay-service/src/farming/water/water.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { WaterService } from "./water.service"
import {
    SystemEntity,
    UserSchema,
    PlacedItemSchema,
    SeedGrowthInfoEntity,
    CropCurrentState,
    SystemId,
    Activities,
    getPostgreSqlToken,
    CropId,
    PlacedItemTypeId,
} from "@src/databases"
import { EnergyNotEnoughException, EnergyService, LevelService } from "@src/gameplay"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"
import { GrpcFailedPreconditionException } from "@src/common"
import { GameplayMockUserService, GameplayConnectionService, TestingInfraModule } from "@src/testing"

describe("WaterService", () => {
    let service: WaterService
    let dataSource: DataSource
    let levelService: LevelService
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [WaterService, EnergyService, LevelService],
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(WaterService)
        levelService = moduleRef.get(LevelService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully water and update tile state, energy, and experience", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            usePesticide: { energyConsume, experiencesGain },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemSchema, {
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
            seedGrowthInfo: {
                currentState: CropCurrentState.NeedWater,
                currentStageTimeElapsed: 0,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            }
        })

        // Call the service to use pesticide
        await service.water({
            userId: user.id,
            placedItemTileId: placedItemTile.id,
        })

        // Check if energy and experience were updated correctly
        const userAfter = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id },
            select: ["energy", "level", "experiences"],
        })

        expect(user.energy - userAfter.energy).toBe(energyConsume)
        expect(levelService.computeTotalExperienceForLevel(userAfter) - levelService.computeTotalExperienceForLevel(user)).toBe(experiencesGain)

        // Check if the tile's seed growth info was updated
        const updatedSeedGrowthInfo = await dataSource.manager.findOne(SeedGrowthInfoEntity, {
            where: { id: placedItemTile.seedGrowthInfo.id },
        })

        expect(updatedSeedGrowthInfo.currentState).toBe(CropCurrentState.Normal)
    })

    it("should throw GrpcNotFoundException when tile is not found by its ID", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            usePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })

        const invalidPlacedItemTileId = v4()

        await expect(
            service.water({
                userId: user.id,
                placedItemTileId: invalidPlacedItemTileId,
            }),
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when seed growth info does not exist on tile", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            usePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemSchema, {
            x: 0,
            y: 0,
            userId: user.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
        })

        await expect(
            service.water({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
            }),
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcFailedPreconditionException when tile is not need water", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            usePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemSchema, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                currentState: CropCurrentState.Normal, // Not infested
                currentStageTimeElapsed: 0,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
        })

        await expect(
            service.water({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
            }),
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            usePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1,
        })

        const placedItemTile = await dataSource.manager.save(PlacedItemSchema, {
            x: 0,
            y: 0,
            userId: user.id,
            seedGrowthInfo: {
                currentState: CropCurrentState.NeedWater, // Not weedy
                currentStageTimeElapsed: 0,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
        })

        await expect(
            service.water({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
            }),
        ).rejects.toThrow(EnergyNotEnoughException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
