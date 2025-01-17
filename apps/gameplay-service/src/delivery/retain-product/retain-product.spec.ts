import {
    DeliveringProductEntity,
    ProductId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { RetainProductRequest } from "./retain-product.dto"
import { RetainProductService } from "./retain-product.service"
import { RetainProductModule } from "./retain-product.module"

describe("RetainProductService", () => {
    let dataSource: DataSource
    let service: RetainProductService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [RetainProductModule]
        })
        dataSource = ds
        service = module.get<RetainProductService>(RetainProductService)
    })

    it("Should retain a delivering product successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        //Save user
        const user = await queryRunner.manager.save(UserEntity, {
            ...mockUser,
            deliveringProducts: [
                {
                    quantity: 5,
                    premium: false,
                    productId: ProductId.Egg,
                    index: 1,
                }
            ]
        })

        await queryRunner.startTransaction()
        try {
            const retainProductRequest: RetainProductRequest = {
                userId: user.id,
                deliveringProductId: user.deliveringProducts[0].id
            }

            await service.retainProduct(retainProductRequest)

            // Verify that the delivering product is removed
            const deletedProduct = await queryRunner.manager.findOne(DeliveringProductEntity, {
                where: { id: user.deliveringProducts[0].id }
            })
            expect(deletedProduct).toBeNull()

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
            await queryRunner.manager.delete(DeliveringProductEntity, { userId: mockUser.id })
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
