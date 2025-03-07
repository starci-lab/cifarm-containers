// npx jest apps/gameplay-service/src/delivery/deliver-product/deliver-product.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { DeliverProductService } from "./deliver-more-product.service"
import { DeliverProductRequest } from "./deliver-more-product.dto"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    InventoryEntity,
    getPostgreSqlToken,
    InventoryTypeEntity
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"
import { GrpcFailedPreconditionException } from "@src/common"

describe("DeliverProductService", () => {
    let service: DeliverProductService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let gameplayConnectionService: GameplayConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [DeliverProductService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(DeliverProductService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
    })

    it("should successfully deliver product", async () => {
        const quantity = 20
        const deliveryQuantity = 10

        const inventoryType = await dataSource.manager.findOne(InventoryTypeEntity, {
            where: { deliverable: true }
        })

        const user = await gameplayMockUserService.generate()
        const inventory = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            inventoryTypeId: inventoryType.id,
            quantity
        })

        // Deliver product
        await service.deliverProduct({
            userId: user.id,
            inventoryId: inventory.id,
            quantity: deliveryQuantity,
            index: 1
        })

        // Assert: Check that inventory was updated and the response is correct
        const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: { id: inventory.id }
        })

        expect(updatedInventory.quantity).toBe(quantity - deliveryQuantity) // 100 - 20
    })

    it("should throw GrpcNotFoundException when inventory not found", async () => {
        const user = await gameplayMockUserService.generate()
        const request: DeliverProductRequest = {
            userId: user.id,
            inventoryId: v4(),
            quantity: 20,
            index: 1
        }

        await expect(service.deliverProduct(request)).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when quantity is insufficient", async () => {
        const quantity = 10
        const deliveryQuantity = 20

        const user = await gameplayMockUserService.generate()

        const inventoryType = await dataSource.manager.findOne(InventoryTypeEntity, {
            where: { deliverable: true }
        })

        const inventory = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            inventoryTypeId: inventoryType.id,
            quantity
        })

        await expect(
            service.deliverProduct({
                userId: user.id,
                inventoryId: inventory.id,
                quantity: deliveryQuantity,
                index: 1
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    it("should throw GrpcFailedPreconditionException when inventory type is not deliverable", async () => {
        const quantity = 20
        const deliveryQuantity = 10

        const user = await gameplayMockUserService.generate()

        const inventoryType = await dataSource.manager.findOne(InventoryTypeEntity, {
            where: { deliverable: false }
        })

        const inventory = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            inventoryTypeId: inventoryType.id,
            quantity
        })

        await expect(
            service.deliverProduct({
                userId: user.id,
                inventoryId: inventory.id,
                quantity: deliveryQuantity,
                index: 1
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
