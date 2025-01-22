// npx jest apps/gameplay-service/src/shop/buy-seeds/buy-seeds.spec.ts

import { DataSource } from "typeorm"
import { BuySeedsService } from "./buy-seeds.service"
import { Test } from "@nestjs/testing"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { CropEntity, CropId, getPostgreSqlToken, InventoryEntity, InventoryTypeId, UserEntity } from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UserInsufficientGoldException } from "@src/gameplay"

describe("BuySeedsService", () => {
    let dataSource: DataSource
    let service: BuySeedsService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuySeedsService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(BuySeedsService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("Should successfully buy seeds and update user and inventory", async () => {
        const { price } = await dataSource.manager.findOne(CropEntity, {
            where: { id: CropId.Carrot },
            select: ["price"]
        })
        const quantity = 2

        const user = await gameplayMockUserService.generate({
            golds: price * quantity + 10
        })

        const golds = user.golds

        await service.buySeeds({
            userId: user.id,
            cropId: CropId.Carrot,
            quantity
        })

        const { golds: goldsAfter } = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["golds"]
        })

        expect(golds - goldsAfter).toBe(price * quantity)

        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryTypeId: InventoryTypeId.CarrotSeed
            },
            relations: {
                inventoryType: true
            }
        })

        expect(inventory.quantity).toBe(quantity)
    })

    it("Should throw GrpcNotFoundException when crop is not found", async () => {
        const user = await gameplayMockUserService.generate()
        const invalidCropId = "abc" as CropId // Invalid crop ID

        await expect(
            service.buySeeds({
                userId: user.id,
                cropId: invalidCropId,
                quantity: 2
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("Should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const { price } = await dataSource.manager.findOne(CropEntity, {
            where: { id: CropId.Carrot },
            select: ["price"]
        })

        const quantity = 2
        const user = await gameplayMockUserService.generate({ golds: price * quantity - 10 })

        await expect(
            service.buySeeds({
                userId: user.id,
                cropId: CropId.Carrot,
                quantity
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
