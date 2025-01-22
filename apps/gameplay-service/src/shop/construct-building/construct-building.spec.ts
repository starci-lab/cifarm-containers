// npx jest apps/gameplay-service/src/shop/construct-building/construct-building.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { ConstructBuildingService } from "./construct-building.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    BuildingEntity,
    BuildingId,
    PlacedItemEntity,
    UserEntity,
    getPostgreSqlToken
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UserInsufficientGoldException } from "@src/gameplay"

describe("ConstructBuildingService", () => {
    let dataSource: DataSource
    let service: ConstructBuildingService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ConstructBuildingService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(ConstructBuildingService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully construct a building and update user and placed item", async () => {
        const x = 0, y = 0
        const buildingId = BuildingId.Coop
        const building = await dataSource.manager.findOne(BuildingEntity, {
            where: { id: buildingId }
        })

        const user = await gameplayMockUserService.generate({ golds: building.price + 10 })

        const golds = user.golds

        await service.constructBuilding({
            userId: user.id,
            buildingId: building.id,
            position: { x, y }
        })

        const { golds: goldsAfter } = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["golds"]
        })

        expect(golds - goldsAfter).toBe(building.price)

        const placedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { userId: user.id, placedItemType: { building: { id: buildingId } } }
        })

        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(x)
        expect(placedItem.y).toBe(y)
    })

    it("should throw GrpcNotFoundException when building is not found", async () => {
        const user = await gameplayMockUserService.generate()
        const invalidBuildingId = "invalid_building_id" as BuildingId

        await expect(
            service.constructBuilding({
                userId: user.id,
                buildingId: invalidBuildingId,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })


    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const building = await dataSource.manager.findOne(BuildingEntity, {
            where: { id: BuildingId.Coop }
        })
        const user = await gameplayMockUserService.generate({ golds: building.price - 10 })

        await expect(
            service.constructBuilding({
                userId: user.id,
                buildingId: building.id,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
