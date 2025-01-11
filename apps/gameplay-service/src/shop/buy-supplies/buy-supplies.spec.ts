import {
    InventoryEntity,
    SupplyEntity,
    SupplyId,
    UserEntity
} from "@src/databases"
import { MOCK_USER, createTestModule } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesService } from "./buy-supplies.service"
import { BuySuppliesModule } from "./buy-supplies.module"

describe("BuySuppliesService", () => {
    let dataSource: DataSource
    let service: BuySuppliesService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [BuySuppliesModule]
        })
        dataSource = ds
        service = module.get<BuySuppliesService>(BuySuppliesService)
    })

    it("Should successfully buy supplies and update user and inventory", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            // Step 1: Create a mock user
            const userBeforeBuyingSupply = await queryRunner.manager.save(UserEntity, mockUser)

            // Step 2: Get supply information
            const supply = await queryRunner.manager.findOne(SupplyEntity, {
                where: { id: SupplyId.BasicFertilizer, availableInShop: true }
            })

            // Ensure the supply exists
            expect(supply).toBeDefined()

            // Step 3: Prepare and perform the buy supplies action
            const buySuppliesRequest: BuySuppliesRequest = {
                supplyId: supply.id,
                userId: userBeforeBuyingSupply.id,
                quantity: 1
            }

            await service.buySupplies(buySuppliesRequest)

            // Step 4: Verify user's golds were updated
            const userAfterBuyingSupply = await queryRunner.manager.findOne(UserEntity, {
                where: { id: userBeforeBuyingSupply.id }
            })

            expect(userAfterBuyingSupply.golds).toBe(
                mockUser.golds - supply.price * buySuppliesRequest.quantity
            )

            // Step 5: Verify inventory was updated
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    userId: userBeforeBuyingSupply.id,
                    inventoryType: { supplyId: supply.id }
                },
                relations: { inventoryType: true }
            })

            expect(inventory.quantity).toBe(buySuppliesRequest.quantity)

            await queryRunner.commitTransaction()
        } catch (error) {
            // Rollback transaction in case of error
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
