// import { ConfigModule } from "@nestjs/config"
// import { Test } from "@nestjs/testing"
// import { TypeOrmModule } from "@nestjs/typeorm"
// import { envConfig, Network, SupportedChainKey } from "@src/config"
// import { DeliveringProductEntity, InventoryEntity, ProductId, UserEntity } from "@src/database"
// import { InsufficientInventoryException } from "@src/exceptions"
// import { DataSource, DeepPartial } from "typeorm"
// import { DeliverProductRequest, DeliverProductResponse } from "./spin.dto"
// import { DeliverProductModule } from "./spin.module"
// import { DeliverProductService } from "./spin.service"

// describe("DeliverProductService", () => {
//     let dataSource: DataSource
//     let service: DeliverProductService

//     const users: Array<DeepPartial<UserEntity>> = [
//         {
//             username: "test_user_construct_building_1",
//             chainKey: SupportedChainKey.Solana,
//             accountAddress: "0x123456789abcdef",
//             network: Network.Mainnet,
//             tokens: 50.5,
//             experiences: 10,
//             energy: 5,
//             level: 2,
//             golds: 5000,
//             inventories: [
//                 {
//                     quantity: 20,
//                     inventoryTypeId: ProductId.Egg,
//                     premium: false,
//                     tokenId: null,
//                     isPlaced: false
//                 }
//             ] as DeepPartial<Array<InventoryEntity>>
//         },
//         {
//             username: "test_user_construct_building_2",
//             chainKey: SupportedChainKey.Solana,
//             accountAddress: "0x123456789abcdef",
//             network: Network.Mainnet,
//             tokens: 50.5,
//             experiences: 10,
//             energy: 5,
//             level: 2,
//             golds: 100,
//             inventories: [
//                 {
//                     quantity: 20,
//                     inventoryTypeId: ProductId.Egg,
//                     premium: false,
//                     tokenId: null,
//                     isPlaced: false
//                 }
//             ] as DeepPartial<Array<InventoryEntity>>
//         }
//     ]

//     beforeAll(async () => {
//         const module = await Test.createTestingModule({
//             imports: [
//                 ConfigModule.forRoot({
//                     load: [envConfig],
//                     envFilePath: [".env.local"],
//                     isGlobal: true
//                 }),
//                 TypeOrmModule.forRoot({
//                     type: "postgres",
//                     host: envConfig().database.postgres.gameplay.test.host,
//                     port: envConfig().database.postgres.gameplay.test.port,
//                     username: envConfig().database.postgres.gameplay.test.user,
//                     password: envConfig().database.postgres.gameplay.test.pass,
//                     database: envConfig().database.postgres.gameplay.test.dbName,
//                     autoLoadEntities: true,
//                     synchronize: true
//                 }),
//                 DeliverProductModule
//             ]
//         }).compile()

//         dataSource = module.get(DataSource)
//         service = module.get(DeliverProductService)
//     })

//     it("Should deliver a product successfully", async () => {
//         const userBeforeDeliverProduct = await dataSource.manager.save(UserEntity, users[0])

//         const inventory = await dataSource.manager.findOne(InventoryEntity, {
//             where: { userId: userBeforeDeliverProduct.id }
//         })

//         const deliverProductRequest: DeliverProductRequest = {
//             userId: inventory.userId,
//             inventoryId: inventory.id,
//             quantity: 10,
//             index: 1
//         }

//         const response: DeliverProductResponse = await service.deliverProduct(deliverProductRequest)

//         // Verify inventory update
//         const updatedInventory = await dataSource.manager.findOne(InventoryEntity, {
//             where: { id: inventory.id }
//         })
//         expect(updatedInventory.quantity).toBe(inventory.quantity - deliverProductRequest.quantity)

//         // Verify delivering product creation
//         const deliveringProduct = await dataSource.manager.findOne(DeliveringProductEntity, {
//             where: { id: response.deliveringProductId }
//         })

//         expect(deliveringProduct).toBeDefined()
//         expect(deliveringProduct.quantity).toBe(deliverProductRequest.quantity)
//         expect(deliveringProduct.userId).toBe(deliverProductRequest.userId)
//     })

//     it("Should fail when insufficient inventory quantity", async () => {
//         const userBeforeDeliverProduct = await dataSource.manager.save(UserEntity, users[1])

//         const inventory = await dataSource.manager.findOne(InventoryEntity, {
//             where: { userId: userBeforeDeliverProduct.id }
//         })

//         const deliverProductRequest: DeliverProductRequest = {
//             userId: inventory.userId,
//             inventoryId: inventory.id,
//             quantity: 100,
//             index: 1
//         }

//         await expect(service.deliverProduct(deliverProductRequest)).rejects.toThrow(
//             new InsufficientInventoryException(inventory.id, deliverProductRequest.quantity)
//         )
//     })

//     afterAll(async () => {
//         await dataSource.manager.delete(UserEntity, users)
//     })
// })
