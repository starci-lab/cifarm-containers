import {
    DeliveringProductEntity,
    InventoryEntity,
    ProductId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { DeliverProductRequest } from "./deliver-product.dto"
import { DeliverProductModule } from "./deliver-product.module"
import { DeliverProductService } from "./deliver-product.service"

describe("DeliverProductService", () => {
    let dataSource: DataSource
    let service: DeliverProductService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [DeliverProductModule]
        })
        dataSource = ds
        service = module.get<DeliverProductService>(DeliverProductService)
    })

    it("Should deliver a product successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        const userBeforeDeliverProduct = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()

        try {

            const inventory = await queryRunner.manager.save(InventoryEntity, {
                userId: userBeforeDeliverProduct.id,
                inventoryTypeId: ProductId.Egg,
                quantity: 20
            })

            const deliverProductRequest: DeliverProductRequest = {
                userId: inventory.userId,
                inventoryId: inventory.id,
                quantity: 10,
                index: 1
            }

            await service.deliverProduct(deliverProductRequest)

            // Verify inventory update
            const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { id: inventory.id }
            })
            expect(updatedInventory.quantity).toBe(inventory.quantity - deliverProductRequest.quantity)

            // Verify delivering product creation
            const deliveringProduct = await queryRunner.manager.findOne(DeliveringProductEntity, {
                where: {
                    userId: deliverProductRequest.userId,
                    productId: inventory.inventoryTypeId,
                    quantity: deliverProductRequest.quantity
                }
            })

            expect(deliveringProduct).toBeDefined()
            expect(deliveringProduct.quantity).toBe(deliverProductRequest.quantity)
            expect(deliveringProduct.userId).toBe(deliverProductRequest.userId)

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })

    afterAll(async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        try {
            await queryRunner.startTransaction()
            await queryRunner.manager.delete(UserEntity, mockUser)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
