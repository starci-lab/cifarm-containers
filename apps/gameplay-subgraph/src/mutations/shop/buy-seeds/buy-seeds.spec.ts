// npx jest apps/gameplay-service/src/shop/buy-seeds/buy-seeds.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { CropId, CropSchema, getMongooseToken, InventorySchema, InventoryTypeId, UserSchema } from "@src/databases"
import { UserInsufficientGoldException } from "@src/gameplay"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { BuySeedsService } from "./buy-seeds.service"

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
        const crop = await connection.model<CropSchema>(CropSchema.name)
            .findById(createObjectId(CropId.Carrot))
        
        const quantity = 2
        const user = await gameplayMockUserService.generate({ golds: crop.price * quantity + 10 })
        const initialGolds = user.golds

        await service.buySeeds(
            {
                id: user.id
            },
            {
                cropId: CropId.Carrot,
                quantity
            }
        )

        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findOne({ _id: user._id })
        expect(initialGolds - updatedUser.golds).toBe(crop.price * quantity)

        const inventory = await connection.model<InventorySchema>(InventorySchema.name).findOne({
            user: user.id,
            inventoryType: createObjectId(InventoryTypeId.CarrotSeed),
        })
        expect(inventory.quantity).toBe(quantity)
    })

    it("Should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const crop = await connection.model<CropSchema>(CropSchema.name)
            .findById(createObjectId(CropId.Carrot))
        
        const user = await gameplayMockUserService.generate({ golds: crop.price * 2 - 5 })
        await expect(
            service.buySeeds(
                {
                    id: user.id
                },
                {
                    cropId: CropId.Carrot,
                    quantity: 2 })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
