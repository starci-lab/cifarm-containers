// npx jest apps/gameplay-service/src/shop/buy-supplies/buy-supplies.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { BuySuppliesService } from "./buy-supplies.service"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    SupplyEntity,
    SupplyId,
    getPostgreSqlToken,
    InventoryEntity,
    InventoryTypeEntity,
    UserEntity
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { UserInsufficientGoldException } from "@src/gameplay"

describe("BuySuppliesService", () => {
    let dataSource: DataSource
    let service: BuySuppliesService
    let connectionService: ConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuySuppliesService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(BuySuppliesService)
        connectionService = moduleRef.get(ConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy supplies and update user and inventory", async () => {
        const supply = await dataSource.manager.findOne(SupplyEntity, {
            where: { id: SupplyId.AnimalFeed }
        })
        const quantity = 2

        const user = await gameplayMockUserService.generate({ golds: supply.price * quantity + 100 })

        const golds = user.golds

        const inventoryType = await dataSource.manager.findOne(InventoryTypeEntity, {
            where: { supplyId: supply.id }
        })

        await service.buySupplies({
            userId: user.id,
            supplyId: supply.id,
            quantity: 2
        })

        const { golds: goldsAfter } = await dataSource.manager.findOne(UserEntity, {
            where: { id: user.id },
            select: ["golds"]
        })

        expect(golds - goldsAfter).toBe(supply.price * quantity)

        const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: user.id,
                inventoryTypeId: inventoryType.id
            }
        })

        expect(updatedInventory.quantity).toBe(quantity)
    })

    it("should throw GrpcNotFoundException when supply is not found", async () => {
        const user = await gameplayMockUserService.generate()
        const invalidSupplyId = "invalid_supply_id" as SupplyId

        await expect(
            service.buySupplies({
                userId: user.id,
                supplyId: invalidSupplyId,
                quantity: 2
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw UserInsufficientGoldException when user has insufficient gold", async () => {
        const supply = await dataSource.manager.findOne(SupplyEntity, {
            where: { id: SupplyId.AnimalFeed }
        })
        const user = await gameplayMockUserService.generate({ golds: supply.price - 10 })

        await expect(
            service.buySupplies({
                userId: user.id,
                supplyId: supply.id,
                quantity: 2
            })
        ).rejects.toThrow(UserInsufficientGoldException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})