// npx jest apps/gameplay-service/src/upgrade/upgrade-building/upgrade-building.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { UpgradeBuildingService } from "./upgrade-building.service"
import { UpgradeBuildingRequest } from "./upgrade-building.dto"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    BuildingId,
    PlacedItemEntity,
    PlacedItemTypeId,
    UpgradeEntity,
    getPostgreSqlToken
} from "@src/databases"
import { GoldBalanceService, UserInsufficientGoldException } from "@src/gameplay"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"
import { GrpcFailedPreconditionException } from "@src/common"

describe("UpgradeBuildingService", () => {
    let service: UpgradeBuildingService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [UpgradeBuildingService, GoldBalanceService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(UpgradeBuildingService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should successfully upgrade building", async () => {
        const currentUpgrade = 0
        const nextLevel = currentUpgrade + 1

        const upgrade = await dataSource.manager.findOne(UpgradeEntity, {
            where: { upgradeLevel: nextLevel, buildingId: BuildingId.Coop }
        })

        const user = await gameplayMockUserService.generate({
            golds: upgrade.upgradePrice + 10
        })

        const placedItemBuilding = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            buildingInfo: {
                currentUpgrade: currentUpgrade
            },
            placedItemTypeId: PlacedItemTypeId.Coop,
            x: 0,
            y: 0
        })

        await service.upgradeBuilding({
            userId: user.id,
            placedItemBuildingId: placedItemBuilding.id
        })

        const updatedPlacedItemBuilding = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: placedItemBuilding.id },
            relations: {
                buildingInfo: true
            }
        })

        expect(updatedPlacedItemBuilding.buildingInfo.currentUpgrade).toBe(currentUpgrade + 1)
    })

    it("should throw GrpcNotFoundException when placed item is not found", async () => {
        const user = await gameplayMockUserService.generate()

        const request: UpgradeBuildingRequest = {
            userId: user.id,
            placedItemBuildingId: v4() // Invalid placed item ID
        }

        await expect(service.upgradeBuilding(request)).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when building is at max upgrade level", async () => {
        const upgrade = await dataSource.manager.findOne(UpgradeEntity, {
            where: { buildingId: BuildingId.Coop },
            order: { upgradeLevel: "DESC" }
        })
        const user = await gameplayMockUserService.generate()

        const placedItemBuilding = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            buildingInfo: {
                currentUpgrade: upgrade.upgradeLevel
            },
            placedItemTypeId: PlacedItemTypeId.Coop,
            x: 0,
            y: 0
        })

        await expect(
            service.upgradeBuilding({
                userId: user.id,
                placedItemBuildingId: placedItemBuilding.id
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcFailedPreconditionException when user has insufficient gold", async () => {
        const currentLevel = 0
        const nextLevel = currentLevel + 1
        const upgrade = await dataSource.manager.findOne(UpgradeEntity, {
            where: { upgradeLevel: nextLevel, buildingId: BuildingId.Coop }
        })
        
        const user = await gameplayMockUserService.generate({
            golds: upgrade.upgradePrice - 10
        })
        const placedItemBuilding = await dataSource.manager.save(PlacedItemEntity, {
            userId: user.id,
            buildingInfo: {
                currentUpgrade: 0
            },
            placedItemTypeId: PlacedItemTypeId.Coop,
            x: 0,
            y: 0
        })

        await expect(
            service.upgradeBuilding({
                userId: user.id,
                placedItemBuildingId: placedItemBuilding.id
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
