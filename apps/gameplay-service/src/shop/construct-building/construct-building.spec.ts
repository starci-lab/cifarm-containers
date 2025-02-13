// npx jest apps/gameplay-service/src/shop/construct-building/construct-building.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { BuildingId, BuildingSchema, getMongooseToken, PlacedItemSchema, UserSchema } from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { ConstructBuildingService } from "./construct-building.service"

describe("ConstructBuildingService", () => {
    let connection: Connection
    let service: ConstructBuildingService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [ConstructBuildingService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(ConstructBuildingService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully construct a building and update user and placed item", async () => {
        const x = 0, y = 0
        const building = await connection.model<BuildingSchema>(BuildingSchema.name).findById(createObjectId(BuildingId.Barn))
        const user = await gameplayMockUserService.generate({ golds: building.price + 10 })
        const golds = user.golds

        await service.constructBuilding({
            userId: user.id,
            buildingId: BuildingId.Barn,
            position: { x, y }
        })

        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findById(user.id)
        expect(golds - updatedUser.golds).toBe(building.price)

        const placedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findOne({
            placedItemType: createObjectId(BuildingId.Barn),
        })
        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(x)
        expect(placedItem.y).toBe(y)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const building = await connection.model<BuildingSchema>(BuildingSchema.name).findOne()
        const user = await gameplayMockUserService.generate({ golds: building.price - 10 })

        await expect(
            service.constructBuilding({
                userId: user.id,
                buildingId: BuildingId.Barn,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
