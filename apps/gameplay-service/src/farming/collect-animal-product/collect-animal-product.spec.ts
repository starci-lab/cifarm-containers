// import { ConfigModule } from "@nestjs/config"
// import { Test } from "@nestjs/testing"
// import { TypeOrmModule } from "@nestjs/typeorm"
// import { envConfig, Network, SupportedChainKey } from "@src/config"
// import {
//     InventoryEntity,
//     InventoryType,
//     InventoryTypeEntity,
//     PlacedItemEntity,
//     UserEntity,
//     AnimalInfoEntity,
//     ProductEntity
// } from "@src/database"
// import { DataSource, DeepPartial } from "typeorm"
// import { CollectAnimalProductRequest } from "./collect-animal-product.dto"
// import { CollectAnimalProductModule } from "./collect-animal-product.module"
// import { CollectAnimalProductService } from "./collect-animal-product.service"

// describe("CollectAnimalProductService", () => {
//     let dataSource: DataSource
//     let service: CollectAnimalProductService

//     // Test users
//     const users: Array<DeepPartial<UserEntity>> = [
//         {
//             username: "test_user_1",
//             chainKey: SupportedChainKey.Solana,
//             accountAddress: "0x123456789abcdef",
//             network: Network.Mainnet,
//             tokens: 50.5,
//             experiences: 10,
//             energy: 5,
//             level: 2,
//             golds: 1000
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
//                 CollectAnimalProductModule
//             ],
//             providers: []
//         }).compile()

//         dataSource = module.get(DataSource)
//         service = module.get(CollectAnimalProductService)
//     })

//     it("Should collect animal product successfully", async () => {
//         const user = await dataSource.manager.save(UserEntity, users[0])

//         // Set up inventory type
//         const product = await dataSource.manager.save(ProductEntity, {
//             name: "Animal Product",
//             animalId: "some-animal-id"
//         })

//         const inventoryType = await dataSource.manager.save(InventoryTypeEntity, {
//             type: InventoryType.Product,
//             product: product
//         })

//         // Set up placed item (animal)
//         const animalInfo = await dataSource.manager.save(AnimalInfoEntity, {
//             hasYielded: true,
//             harvestQuantityRemaining: 10,
//             animalId: product.animalId
//         })

//         const placedItem = await dataSource.manager.save(PlacedItemEntity, {
//             userId: user.id,
//             animalInfo: animalInfo
//         })

//         const request: CollectAnimalProductRequest = {
//             userId: user.id,
//             placedItemAnimalId: placedItem.id
//         }

//         // Collect animal product
//         const response = await service.collectAnimalProduct(request)

//         expect(response).toBeDefined()
//         expect(response.inventoryAnimalProductId).toBeDefined()

//         // Verify inventory was created
//         const inventory = await dataSource.manager.findOne(InventoryEntity, {
//             where: { id: response.inventoryAnimalProductId },
//             relations: { inventoryType: true }
//         })

//         expect(inventory).toBeDefined()
//         expect(inventory.quantity).toBe(animalInfo.harvestQuantityRemaining)
//         expect(inventory.inventoryType.id).toBe(inventoryType.id)

//         // Verify animal yield status reset
//         const updatedPlacedItem = await dataSource.manager.findOne(PlacedItemEntity, {
//             where: { id: placedItem.id },
//             relations: { animalInfo: true }
//         })

//         expect(updatedPlacedItem.animalInfo.hasYielded).toBe(false)
//     })

//     it("Should throw error if animal is not currently yielding", async () => {
//         const user = await dataSource.manager.save(UserEntity, users[0])

//         const animalInfo = await dataSource.manager.save(AnimalInfoEntity, {
//             hasYielded: false,
//             animalId: "some-animal-id"
//         })

//         const placedItem = await dataSource.manager.save(PlacedItemEntity, {
//             userId: user.id,
//             animalInfo: animalInfo
//         })

//         const request: CollectAnimalProductRequest = {
//             userId: user.id,
//             placedItemAnimalId: placedItem.id
//         }

//         await expect(service.collectAnimalProduct(request)).rejects.toThrow(
//             `Animal is not currently yielding: ${request.placedItemAnimalId}`
//         )
//     })

//     it("Should throw error if placed item is not found", async () => {
//         const request: CollectAnimalProductRequest = {
//             userId: "some-user-id",
//             placedItemAnimalId: "non-existent-id"
//         }

//         await expect(service.collectAnimalProduct(request)).rejects.toThrow(
//             `Placed item not found: ${request.placedItemAnimalId}`
//         )
//     })

//     afterAll(async () => {
//         await dataSource.manager.remove(UserEntity, users)
//     })
// })
