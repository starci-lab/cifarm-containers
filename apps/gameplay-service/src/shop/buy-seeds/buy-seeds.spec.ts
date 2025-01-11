import {
    CropEntity,
    CropId,
    InventoryEntity,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsService } from "./buy-seeds.service"
import { BuySeedsModule } from "./buy-seeds.module"

describe("BuySeedsService", () => {
    let dataSource: DataSource
    let service: BuySeedsService
    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [BuySeedsModule]
        })
        dataSource = ds
        service = module.get<BuySeedsService>(BuySeedsService)
    })

    it("Should successfully buy seeds and update user and inventory", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()
        await queryRunner.startTransaction()

        try {
            const crop = await queryRunner.manager.findOne(CropEntity, {
                where: { id: CropId.Carrot }
            })

            const userBeforeBuyingSeed = await queryRunner.manager.save(UserEntity, mockUser)

            const buySeedRequest: BuySeedsRequest = {
                cropId: crop.id,
                userId: userBeforeBuyingSeed.id,
                quantity: 1
            }

            // Buy seeds
            await service.buySeeds(buySeedRequest)

            // Verify user golds
            const userAfterBuyingSeed = await queryRunner.manager.findOne(UserEntity, {
                where: { id: userBeforeBuyingSeed.id }
            })
            expect(userAfterBuyingSeed.golds).toBe(
                mockUser.golds - crop.price * buySeedRequest.quantity
            )

            // Verify inventory
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: { userId: userBeforeBuyingSeed.id, inventoryType: { cropId: crop.id } },
                relations: { inventoryType: true }
            })
            expect(inventory.quantity).toBe(buySeedRequest.quantity)

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
            await queryRunner.manager.remove(UserEntity, mockUser)
            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()
            throw error
        } finally {
            await queryRunner.release()
        }
    })
})
