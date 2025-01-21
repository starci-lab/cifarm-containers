// import {
//     InventoryEntity,
//     InventoryType,
//     PlacedItemEntity,
//     TileId,
//     UserEntity
// } from "@src/databases"
// import { createTestModule, MOCK_USER } from "@src/testing/infra"
// import { DataSource, DeepPartial } from "typeorm"
// import { PlaceTileRequest } from "./place-tile.dto"
// import { PlaceTileModule } from "./place-tile.module"
// import { PlaceTileService } from "./place-tile.service"

// describe("PlaceTileService", () => {
//     let dataSource: DataSource
//     let service: PlaceTileService

//     const mockUser: DeepPartial<UserEntity> = {
//         ...MOCK_USER
//     }

//     beforeAll(async () => {
//         const { module, dataSource: ds } = await createTestModule({
//             imports: [PlaceTileModule]
//         })
//         dataSource = ds
//         service = module.get<PlaceTileService>(PlaceTileService)
//     })

//     it("Should successfully place a tile", async () => {
//         const queryRunner = dataSource.createQueryRunner()
//         await queryRunner.connect()
//         // Setup user and inventory
//         const user = await queryRunner.manager.save(UserEntity, mockUser)

//         const inventory = await queryRunner.manager.save(InventoryEntity, {
//             userId: user.id,
//             inventoryType: {
//                 id: TileId.BasicTile1,
//                 type: InventoryType.Tile,
//             },
//             quantity: 2
//         })

//         await queryRunner.startTransaction()

//         try {
//             const request: PlaceTileRequest = {
//                 userId: user.id,
//                 inventoryTileId: inventory.id,
//                 position: { x: 10, y: 20 }
//             }

//             // Execute place tile
//             const { placedItemTileId } = await service.placeTile(request)

//             // Verify inventory was updated
//             const updatedInventory = await queryRunner.manager.findOne(InventoryEntity, {
//                 where: { id: inventory.id }
//             })
//             expect(updatedInventory.quantity).toBe(1)

//             // Verify placed item was created
//             const placedTile = await queryRunner.manager.findOne(PlacedItemEntity, {
//                 where: {
//                     userId: user.id,
//                     id: placedItemTileId,
//                     x: request.position.x,
//                     y: request.position.y
//                 }
//             })
//             expect(placedTile).toBeDefined()

//             // Verify response
//             expect(placedItemTileId).toBe(placedTile.id)

//             await queryRunner.commitTransaction()
//         } catch (error) {
//             await queryRunner.rollbackTransaction()
//             throw error
//         } finally {
//             await queryRunner.release()
//         }
//     })

//     afterAll(async () => {
//         const queryRunner = dataSource.createQueryRunner()
//         await queryRunner.connect()

//         try {
//             await queryRunner.startTransaction()
//             await queryRunner.manager.delete(UserEntity, mockUser)
//             await queryRunner.commitTransaction()
//         } catch (error) {
//             await queryRunner.rollbackTransaction()
//             throw error
//         } finally {
//             await queryRunner.release()
//         }
//     })
// })
