import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/grpc"
import { InventoryEntity, SupplyEntity, SupplyId, UserEntity } from "@src/databases"
import { GoldBalanceService, InventoryService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { BuySuppliesRequest } from "./buy-supplies.dto"
import { BuySuppliesModule } from "./buy-supplies.module"
import { BuySuppliesService } from "./buy-supplies.service"

describe("BuySuppliesService", () => {
    let dataSource: DataSource
    let service: BuySuppliesService

    // Test users
    const users: Array<DeepPartial<UserEntity>> = [
        {
            username: "test_user_1",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 1000
        },
        {
            username: "test_user_2",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 1000
        }
    ]

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: [".env.local"],
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().databases.postgres.gameplay.test.host,
                    port: envConfig().databases.postgres.gameplay.test.port,
                    username: envConfig().databases.postgres.gameplay.test.user,
                    password: envConfig().databases.postgres.gameplay.test.pass,
                    database: envConfig().databases.postgres.gameplay.test.dbName,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                BuySuppliesModule
            ],
            providers: [GoldBalanceService, InventoryService]
        }).compile()

        dataSource = module.get(DataSource)
        service = module.get(BuySuppliesService)
    })

    it("Should happy case work", async () => {
        const userBeforeBuyingSupply = await dataSource.manager.save(UserEntity, users[0])

        // Get supply
        const supply = await dataSource.manager.findOne(SupplyEntity, {
            where: { id: SupplyId.BasicFertilizer, availableInShop: true }
        })

        const buySuppliesRequest: BuySuppliesRequest = {
            supplyId: supply.id,
            userId: userBeforeBuyingSupply.id,
            quantity: 1
        }

        // Buy supplies
        await service.buySupplies(buySuppliesRequest)

        // Check user golds
        const userAfterBuyingSupply = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeBuyingSupply.id }
        })

        expect(userAfterBuyingSupply.golds).toBe(
            users[0].golds - supply.price * buySuppliesRequest.quantity
        )

        // Check inventory
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: userBeforeBuyingSupply.id,
                inventoryType: { supplyId: supply.id }
            },
            relations: { inventoryType: true }
        })

        expect(inventory.quantity).toBe(buySuppliesRequest.quantity)
    })

    it("Should stack inventory when buying multiple times", async () => {
        const userBeforeBuyingSupply = await dataSource.manager.save(UserEntity, users[1])

        // Get supply
        const supply = await dataSource.manager.findOne(SupplyEntity, {
            where: { id: SupplyId.BasicFertilizer, availableInShop: true }
        })

        // First buy request
        const buySuppliesFirstRequest: BuySuppliesRequest = {
            supplyId: supply.id,
            userId: userBeforeBuyingSupply.id,
            quantity: 2
        }
        await service.buySupplies(buySuppliesFirstRequest)

        // Second buy request
        const buySuppliesSecondRequest: BuySuppliesRequest = {
            supplyId: supply.id,
            userId: userBeforeBuyingSupply.id,
            quantity: 2
        }
        await service.buySupplies(buySuppliesSecondRequest)

        // Check user golds
        const userAfterBuyingSupply = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeBuyingSupply.id }
        })

        expect(userAfterBuyingSupply.golds).toBe(
            users[1].golds -
                (supply.price * buySuppliesFirstRequest.quantity +
                    supply.price * buySuppliesSecondRequest.quantity)
        )

        // Check inventory
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: {
                userId: userBeforeBuyingSupply.id,
                inventoryType: { supplyId: supply.id }
            },
            relations: { inventoryType: true }
        })

        expect(inventory.quantity).toBe(
            buySuppliesFirstRequest.quantity + buySuppliesSecondRequest.quantity
        )
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, users)
    })
})
