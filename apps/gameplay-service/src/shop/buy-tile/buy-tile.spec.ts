import {
    PlacedItemEntity,
    TileEntity,
    TileId,
    UserEntity
} from "@src/databases"
import { MOCK_USER, createTestModule } from "@src/testing/infra"
import { DataSource, DeepPartial } from "typeorm"
import { BuyTileRequest } from "./buy-tile.dto"
import { BuyTileService } from "./buy-tile.service"
import { BuyTileModule } from "./buy-tile.module"

describe("BuyTileService", () => {
    let dataSource: DataSource
    let service: BuyTileService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [BuyTileModule]
        })
        dataSource = ds
        service = module.get<BuyTileService>(BuyTileService)
    })

    it("Should buy a tile successfully", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        // Step 1: Create a mock user
        const userBeforeBuyTile = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()

        try {
            // Step 2: Get tile information
            const tile = await queryRunner.manager.findOne(TileEntity, {
                where: { id: TileId.BasicTile1, availableInShop: true }
            })

            // Ensure the tile exists
            expect(tile).toBeDefined()

            // Step 3: Prepare and perform the buy tile action
            const buyTileRequest: BuyTileRequest = {
                userId: userBeforeBuyTile.id,
                position: { x: 5, y: 10 }
            }

            await service.buyTile(buyTileRequest)

            // Step 4: Verify user's golds were updated
            const userAfterBuyTile = await queryRunner.manager.findOne(UserEntity, {
                where: { id: userBeforeBuyTile.id }
            })

            expect(userAfterBuyTile.golds).toBe(
                mockUser.golds - tile.price
            )

            // Step 5: Verify placed item was created
            const placedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: {
                    userId: userBeforeBuyTile.id,
                    x: buyTileRequest.position.x,
                    y: buyTileRequest.position.y
                },
                relations: { placedItemType: true }
            })

            expect(placedItem).toBeDefined()
            expect(placedItem.x).toBe(buyTileRequest.position.x)
            expect(placedItem.y).toBe(buyTileRequest.position.y)
            expect(placedItem.placedItemType.tileId).toBe(TileId.BasicTile1)

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
