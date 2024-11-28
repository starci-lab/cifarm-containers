import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { CropEntity, InventoryEntity, UserEntity } from "@src/database"
import { SeedDataModule } from "@src/services"
import * as path from "path"
import { DataSource, DeepPartial } from "typeorm"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsModule } from "./buy-seeds.module"
import { BuySeedsService } from "./buy-seeds.service"

describe("BuySeedsService", () => {
    let dataSource: DataSource
    let service: BuySeedsService
    const user1: DeepPartial<UserEntity> = {
        username: "test_user_1",
        chainKey: SupportedChainKey.Solana,
        accountAddress: "0x123456789abcdef",
        network: Network.Mainnet,
        tokens: 50.5,
        experiences: 10,
        energy: 5,
        level: 2,
        golds: 1000
    }
    const user2: DeepPartial<UserEntity> = {
        username: "test_user_12",
        chainKey: SupportedChainKey.Solana,
        accountAddress: "0x123456789abcdef",
        network: Network.Mainnet,
        tokens: 50.5,
        experiences: 10,
        energy: 5,
        level: 2,
        golds: 1000
    }

    beforeAll(async () => {
        const module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [envConfig],
                    envFilePath: path.join(process.cwd(), ".env.local"),
                    isGlobal: true
                }),
                TypeOrmModule.forRoot({
                    type: "postgres",
                    host: envConfig().database.postgres.gameplay.test.host,
                    port: envConfig().database.postgres.gameplay.test.port,
                    username: envConfig().database.postgres.gameplay.test.user,
                    password: envConfig().database.postgres.gameplay.test.pass,
                    database: envConfig().database.postgres.gameplay.test.dbName,
                    autoLoadEntities: true,
                    synchronize: true
                }),
                SeedDataModule,
                BuySeedsModule
            ],
            providers: []
        }).compile()
        dataSource = module.get(DataSource)
        service = module.get(BuySeedsService)
    })

    it("Should happy case work", async () => {
        const userBeforeBuydingSeed = await dataSource.manager.save(UserEntity, user1)

        // Get carrot
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: "carrot" }
        })

        const buySeedRequest = {
            cropId: crop.id,
            userId: userBeforeBuydingSeed.id,
            quantity: 1
        }

        // Buy seeds
        await service.buySeeds(buySeedRequest)

        // Check user golds
        const userAfterBuyingSeed = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeBuydingSeed.id }
        })

        expect(userAfterBuyingSeed.golds).toBe(user1.golds - crop.price * buySeedRequest.quantity)

        // Check inventory
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: { userId: userBeforeBuydingSeed.id, inventoryType: { cropId: crop.id } },
            relations: {
                inventoryType: true
            }
        })

        expect(inventory.quantity).toBe(buySeedRequest.quantity)
    })

    it("Should basic scenario work should buy 2 time, stack inventory", async () => {
        const userBeforeBuydingSeed = await dataSource.manager.save(UserEntity, user2)

        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: "carrot" }
        })

        // buySeedFirstRequest
        const buySeedFirstRequest: BuySeedsRequest = {
            cropId: crop.id,
            userId: userBeforeBuydingSeed.id,
            quantity: 2
        }
        await service.buySeeds(buySeedFirstRequest)

        // buySeedSecondRequest
        const buySeedSecondRequest: BuySeedsRequest = {
            cropId: crop.id,
            userId: userBeforeBuydingSeed.id,
            quantity: 2
        }
        await service.buySeeds(buySeedSecondRequest)

        // Check user golds
        const userAfterBuyingSeed = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeBuydingSeed.id }
        })

        expect(userAfterBuyingSeed.golds).toBe(
            user2.golds -
                (crop.price * buySeedFirstRequest.quantity +
                    crop.price * buySeedSecondRequest.quantity)
        )

        // Check inventory
        const inventory = await dataSource.manager.findOne(InventoryEntity, {
            where: { userId: userBeforeBuydingSeed.id, inventoryType: { cropId: crop.id } },
            relations: {
                inventoryType: true
            }
        })

        expect(inventory.quantity).toBe(
            buySeedFirstRequest.quantity + buySeedSecondRequest.quantity
        )
    })

    afterAll(async () => {
        Promise.all([
            await dataSource.manager.delete(UserEntity, user1.id),
            await dataSource.manager.delete(UserEntity, user2.id)
        ])
    })
})