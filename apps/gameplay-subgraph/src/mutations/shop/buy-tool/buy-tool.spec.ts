// npx jest apps/gameplay-service/src/shop/buy-animal/buy-animal.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { AnimalId, AnimalSchema, getMongooseToken, PlacedItemSchema, PlacedItemTypeId, ToolId, UserSchema } from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { BuyToolService } from "./buy-tool.service"

describe("BuyToolService", () => {
    let connection: Connection
    let service: BuyToolService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyToolService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(BuyToolService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy an animal and update user and placed item", async () => {
        const x = 100, y = 100
        const animal = await connection.model<AnimalSchema>(AnimalSchema.name)
            .findById(createObjectId(AnimalId.Cow))
        console.log("animal", animal)
        const user = await gameplayMockUserService.generate({ golds: animal.price + 10 })

        await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            user: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.Barn),
            x,
            y,
            buildingInfo: {
                currentUpgrade: 1,
                maxCapacity: 10
            }
        })

        const golds = user.golds
        await service.buyTool({
            id: user.id
        },
        {
            toolId: ToolId.AnimalMedicine,
        })

        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findById(user.id)
        expect(golds - updatedUser.golds).toBe(animal.price)

        const placedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findOne({
            x, y
        })
        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(x)
        expect(placedItem.y).toBe(y)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const animal = await connection.model<AnimalSchema>(AnimalSchema.name)
            .findById(createObjectId(AnimalId.Cow))
        const user = await gameplayMockUserService.generate({ golds: animal.price - 10 })

        await expect(
            service.buyTool({
                id: user.id
            },
            {
                toolId: ToolId.AnimalMedicine,
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
