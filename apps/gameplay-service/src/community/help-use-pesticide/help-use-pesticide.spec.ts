// npx jest apps/gameplay-service/src/community/help-use-pesticide/help-use-pesticide.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { HelpUsePesticideService } from "./help-use-pesticide.service"
import {
    SystemEntity,
    UserSchema,
    PlacedItemEntity,
    SeedGrowthInfoEntity,
    CropCurrentState,
    SystemId,
    Activities,
    getPostgreSqlToken,
    CropId,
    PlacedItemTypeId,
    CropEntity,
} from "@src/databases"
import { EnergyNotEnoughException, LevelService } from "@src/gameplay"
import { GrpcInvalidArgumentException, GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"
import { GrpcFailedPreconditionException } from "@src/common"
import { GameplayMockUserService, GameplayConnectionService, TestingInfraModule } from "@src/testing"

describe("HelpUsePesticideService", () => {
    let service: HelpUsePesticideService
    let dataSource: DataSource
    let levelService: LevelService
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [HelpUsePesticideService],
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(HelpUsePesticideService)
        levelService = moduleRef.get(LevelService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully help use pesticide and update tile state, energy, and experience", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            helpUsePesticide: { energyConsume, experiencesGain },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })
        const neighborUser = await gameplayMockUserService.generate()

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: neighborUser.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
            seedGrowthInfo: {
                currentState: CropCurrentState.IsInfested,
                currentStageTimeElapsed: 0,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            }
        })

        // Call the service to use herbicide
        await service.helpUsePesticide({
            userId: user.id,
            placedItemTileId: placedItemTile.id,
            neighborUserId: neighborUser.id,
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
            helpUsePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })

        const invalidPlacedItemTileId = v4()

        await expect(
            service.helpUsePesticide({
                userId: user.id,
                placedItemTileId: invalidPlacedItemTileId,
                neighborUserId: v4()
            }),
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when seed growth info does not exist on tile", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            helpUsePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })
        const neighborUser = await gameplayMockUserService.generate()

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: neighborUser.id,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
        })

        await expect(
            service.helpUsePesticide({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                neighborUserId: neighborUser.id,
            }),
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcFailedPreconditionException when tile is not infested", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            helpUsePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume + 1,
        })
        const neighborUser = await gameplayMockUserService.generate()

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: neighborUser.id,
            seedGrowthInfo: {
                currentState: CropCurrentState.Normal, // Not weedy
                currentStageTimeElapsed: 0,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
        })

        await expect(
            service.helpUsePesticide({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                neighborUserId: neighborUser.id,
            }),
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw EnergyNotEnoughException when user does not have enough energy", async () => {
        const { value } = await dataSource.manager.findOne(SystemEntity, {
            where: { id: SystemId.Activities },
        })
        const {
            helpUsePesticide: { energyConsume },
        } = value as Activities

        const user = await gameplayMockUserService.generate({
            energy: energyConsume - 1,
        })

        const neighborUser = await gameplayMockUserService.generate()

        const placedItemTile = await dataSource.manager.save(PlacedItemEntity, {
            x: 0,
            y: 0,
            userId: neighborUser.id,
            seedGrowthInfo: {
                currentState: CropCurrentState.IsInfested,
                currentStageTimeElapsed: 0,
                cropId: CropId.Carrot,
                harvestQuantityRemaining: 10,
            },
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
        })

        await expect(
            service.helpUsePesticide({
                userId: user.id,
                placedItemTileId: placedItemTile.id,
                neighborUserId: neighborUser.id,
            }),
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
            seedGrowthInfo: {
                currentState: CropCurrentState.IsInfested,
                harvestQuantityRemaining: crop.maxHarvestQuantity,
                cropId
            },
            x: 0,
            y: 0,
            placedItemTypeId: PlacedItemTypeId.BasicTile1,
            userId: user.id
        })

        await expect(
            service.helpUsePesticide({
                userId: user.id,
                neighborUserId: user.id,
                placedItemTileId: placedItemTile.id
            })
        ).rejects.toThrow(GrpcInvalidArgumentException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
