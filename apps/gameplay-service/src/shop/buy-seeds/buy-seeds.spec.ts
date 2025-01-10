import { Test } from "@nestjs/testing"
import { CropEntity, CropId, getPostgreSqlToken, InventoryEntity, PostgreSQLModule, UserEntity } from "@src/databases"
import { EnvModule, Network, PostgreSQLContext, PostgreSQLDatabase, SupportedChainKey } from "@src/env"
import { DataSource, DeepPartial } from "typeorm"
import { BuySeedsRequest } from "./buy-seeds.dto"
import { BuySeedsModule } from "./buy-seeds.module"
import { BuySeedsService } from "./buy-seeds.service"
import { GameplayModule } from "@src/gameplay"
import { OPTIONS_TYPE } from "@src/databases/postgresql/postgresql.module-definition"

describe("BuySeedsService", () => {
    let dataSource: DataSource
    let service: BuySeedsService

    //test users
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
        const databaseOptions: typeof OPTIONS_TYPE = {
            context: PostgreSQLContext.Mock,
            database: PostgreSQLDatabase.Gameplay
        }

        const module = await Test.createTestingModule({
            imports: [
                EnvModule.forRoot(),
                PostgreSQLModule.forRoot(databaseOptions),
                GameplayModule,
                BuySeedsModule
            ],
            providers: [BuySeedsService],
        }).compile()

        dataSource = module.get<DataSource>(getPostgreSqlToken(databaseOptions))

        service = module.get(BuySeedsService)
    })

    it("Should happy case work", async () => {
        const userBeforeBuydingSeed = await dataSource.manager.save(UserEntity, users[0])

        // Get carrot
        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: CropId.Carrot }
        })

        const buySeedRequest: BuySeedsRequest = {
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

        expect(userAfterBuyingSeed.golds).toBe(
            users[0].golds - crop.price * buySeedRequest.quantity
        )

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
        const userBeforeBuydingSeed = await dataSource.manager.save(UserEntity, users[1])

        const crop = await dataSource.manager.findOne(CropEntity, {
            where: { id: CropId.Carrot }
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
            users[1].golds -
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
        await dataSource.manager.remove(UserEntity, users)
    })
})