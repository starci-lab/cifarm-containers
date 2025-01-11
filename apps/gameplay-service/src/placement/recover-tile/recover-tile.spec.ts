import {
    InventoryEntity,
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeId,
    UserEntity
} from "@src/databases"
import { createTestModule, MOCK_USER } from "@src/testing"
import { DataSource, DeepPartial } from "typeorm"
import { RecoverTileRequest } from "./recover-tile.dto"
import { RecoverTileModule } from "./recover-tile.module"
import { RecoverTileService } from "./recover-tile.service"

describe("RecoverTileService", () => {
    let dataSource: DataSource
    let service: RecoverTileService

    const mockUser: DeepPartial<UserEntity> = {
        ...MOCK_USER
    }

    beforeAll(async () => {
        const { module, dataSource: ds } = await createTestModule({
            imports: [RecoverTileModule]
        })
        dataSource = ds
        service = module.get<RecoverTileService>(RecoverTileService)
    })

    it("Should successfully recover a tile", async () => {
        const queryRunner = dataSource.createQueryRunner()
        await queryRunner.connect()

        // Setup user and placed item
        const user = await queryRunner.manager.save(UserEntity, mockUser)

        await queryRunner.startTransaction()

        try {
            //Add placedItem
            const placedItemTile = await queryRunner.manager.save(PlacedItemEntity, {
                userId: user.id,
                x: 0,
                y: 0,
                placedItemType: {
                    id: PlacedItemTypeId.BasicTile1,
                    type: PlacedItemType.Tile
                },
            })

            // Setup request
            const request: RecoverTileRequest = {
                userId: user.id,
                placedItemTileId: placedItemTile.id
            }

            // Execute recover tile
            const response = await service.recoverTile(request)

            // Verify placed item was deleted
            const deletedPlacedItem = await queryRunner.manager.findOne(PlacedItemEntity, {
                where: { id: placedItemTile.id }
            })
            expect(deletedPlacedItem).toBeNull()

            // Verify inventory was updated
            const inventory = await queryRunner.manager.findOne(InventoryEntity, {
                where: {
                    id: response.inventoryTileId
                },
                relations: { inventoryType: true }
            })
            expect(inventory).toBeDefined()
            expect(inventory.quantity).toBe(1)

            // Verify response
            expect(response.inventoryTileId).toBe(inventory.id)

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
