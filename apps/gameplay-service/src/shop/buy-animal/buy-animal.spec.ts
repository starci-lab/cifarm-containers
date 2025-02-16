// npx jest apps/gameplay-service/src/shop/buy-animal/buy-animal.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { AnimalId, AnimalSchema, getMongooseToken, PlacedItemSchema, PlacedItemTypeId, UserSchema } from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { BuyAnimalService } from "./buy-animal.service"

describe("BuyAnimalService", () => {
    let connection: Connection
    let service: BuyAnimalService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyAnimalService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(BuyAnimalService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy an animal and update user and placed item", async () => {
        const x = 100, y = 100
        const animal = await connection.model<AnimalSchema>(AnimalSchema.name)
            .findById(createObjectId(AnimalId.Cow))
        console.log("animal", animal)
        const user = await gameplayMockUserService.generate({ golds: animal.price + 10 })

        const building = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            userId: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.Barn),
            x,
            y,
            buildingInfo: {
                currentUpgrade: 1,
                maxCapacity: 1
            }
        })

        const golds = user.golds
        console.log("sd", {
            userId: user.id,
            animalId: AnimalId.Cow,
            placedItemBuildingId: building._id.toString(),
            position: { x, y }
        })
        await service.buyAnimal({
            userId: user.id,
            animalId: AnimalId.Cow,
            placedItemBuildingId: building._id.toString(),
            position: { x, y }
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

        const building = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).create({
            userId: user.id,
            placedItemType: createObjectId(PlacedItemTypeId.Barn),
            x: 10,
            y: 10,
            buildingInfo: {
                currentUpgrade: 1,
                maxCapacity: 1
            }
        })

        await expect(
            service.buyAnimal({
                userId: user.id,
                animalId: AnimalId.Cow,
                placedItemBuildingId: building._id.toString(),
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
