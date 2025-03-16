// npx jest apps/gameplay-service/src/shop/buy-supplies/buy-supplies.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { getMongooseToken, InventorySchema, InventoryTypeSchema, SupplyId, SupplySchema, UserSchema } from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { BuySuppliesService } from "./buy-supplies.service"

describe("BuySuppliesService", () => {
    let connection: Connection
    let service: BuySuppliesService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuySuppliesService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(BuySuppliesService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy supplies and update user and inventory", async () => {
        const supply = await connection.model<SupplySchema>(SupplySchema.name).findById(createObjectId(SupplyId.AnimalFeed))
        const quantity = 2
        const user = await gameplayMockUserService.generate({ golds: supply.price * quantity + 10 })
        const golds = user.golds
        
        const inventoryType = await connection.model<InventoryTypeSchema>(InventoryTypeSchema.name).findById(createObjectId(SupplyId.AnimalFeed))

        await service.buySupplies({
            userId: user.id,
            supplyId: SupplyId.AnimalFeed,
            quantity
        })

        console.log(inventoryType,"ds")

        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findById(user.id)
        expect(golds - updatedUser.golds).toBe(supply.price * quantity)
        const updatedInventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            inventoryType: inventoryType._id
        })
        expect(updatedInventory.quantity).toBe(quantity)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const supply = await connection.model<SupplySchema>(SupplySchema.name).findById(createObjectId(SupplyId.AnimalFeed))
        const user = await gameplayMockUserService.generate({ golds: supply.price - 10 })

        await expect(
            service.buySupplies({
                userId: user.id,
                supplyId: SupplyId.AnimalFeed,
                quantity: 2
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
