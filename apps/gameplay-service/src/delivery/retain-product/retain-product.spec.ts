// npx jest apps/gameplay-service/src/delivery/retain-product/retain-product.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { RetainProductService } from "./retain-product.service"
import {
    getPostgreSqlToken,
    ProductId,
    InventoryTypeId,
    DeliveringProductEntity,
    InventoryEntity
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { v4 } from "uuid"
import { ConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"

describe("RetainProductService", () => {
    let service: RetainProductService
    let dataSource: DataSource
    let gameplayMockUserService: GameplayMockUserService
    let connectionService: ConnectionService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [RetainProductService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(RetainProductService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
        connectionService = moduleRef.get(ConnectionService)
    })

    it("should successfully retain product", async () => {
        const quantity = 10
        const deliveringProductQuantity = 5

        // Set up necessary data
        const user = await gameplayMockUserService.generate()

        // Create a delivering product for the user
        const deliveringProduct = await dataSource.manager.save(DeliveringProductEntity, {
            userId: user.id,
            quantity: deliveringProductQuantity,
            productId: ProductId.Carrot,
            index: 1
        })

        // Create a matching inventory for the user
        const inventory = await dataSource.manager.save(InventoryEntity, {
            userId: user.id,
            inventoryTypeId: InventoryTypeId.Carrot,
            quantity
        })

        // Act: Call retainProduct
        await service.retainProduct({
            userId: user.id,
            deliveringProductId: deliveringProduct.id
        })

        // Assert: Check that inventory was updated
        const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
            where: { id: inventory.id }
        })

        expect(updatedInventory.quantity).toBe(quantity + deliveringProductQuantity) // 10 + 5

        // Assert: Check if the delivering product was removed
        const removedDeliveringProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
            where: { id: deliveringProduct.id }
        })

        expect(removedDeliveringProduct).toBeNull() // Ensure delivering product is removed
    })

    it("should throw GrpcNotFoundException when delivering product is not found", async () => {
        const user = await gameplayMockUserService.generate()
        await expect(
            service.retainProduct({
                userId: user.id,
                deliveringProductId: v4() // Invalid ID
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await connectionService.closeAll()
    })
})
