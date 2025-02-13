// npx jest apps/gameplay-service/src/shop/buy-seeds/buy-seeds.spec.ts

import { Test } from "@nestjs/testing"
import { Connection } from "mongoose"
import { BuySeedsService } from "./buy-seeds.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { getMongooseToken, CropSchema, UserSchema, InventorySchema, InventoryTypeSchema, InventoryType, CropKey } from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UserInsufficientGoldException } from "@src/gameplay"

describe("BuySeedsService", () => {
    let service: BuySeedsService
    let connection: Connection
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuySeedsService],
        }).compile()

        service = moduleRef.get(BuySeedsService)
        connection = moduleRef.get(getMongooseToken())
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("Should successfully buy seeds and update user and inventory", async () => {
        const crop = await connection.model(CropSchema.name).create({
            id: CropKey.Carrot,
            price: 10,
            availableInShop: true,
        })
        
        const quantity = 2
        const user = await gameplayMockUserService.generate({ golds: crop.price * quantity + 10 })
        const initialGolds = user.golds

        const inventoryType = await connection.model(InventoryTypeSchema.name).create({
            cropId: crop.id,
            type: InventoryType.Seed,
        })

        await service.buySeeds({ userId: user.id, cropId: crop.id, quantity })

        const updatedUser = await connection.model(UserSchema.name).findOne({ id: user.id })
        expect(initialGolds - updatedUser.golds).toBe(crop.price * quantity)

        const inventory = await connection.model(InventorySchema.name).findOne({
            userId: user.id,
            inventoryTypeId: inventoryType.id,
        })
        expect(inventory.quantity).toBe(quantity)
    })

    it("Should throw GrpcNotFoundException when crop is not found", async () => {
        const user = await gameplayMockUserService.generate()
        await expect(
            service.buySeeds({ userId: user.id, cropId: "invalid_crop", quantity: 2 })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("Should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const crop = await connection.model(CropSchema.name).create({
            id: CropKey.Carrot,
            price: 10,
            availableInShop: true,
        })
        
        const user = await gameplayMockUserService.generate({ golds: crop.price * 2 - 5 })
        await expect(
            service.buySeeds({ userId: user.id, cropId: crop.id, quantity: 2 })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
