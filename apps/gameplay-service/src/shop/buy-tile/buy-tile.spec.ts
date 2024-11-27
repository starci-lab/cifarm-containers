import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import {
    PlacedItemEntity,
    PlacedItemType,
    PlacedItemTypeEntity,
    TileEntity,
    TileId,
    UserEntity
} from "@src/database"
import { GoldBalanceService } from "@src/services"
import * as path from "path"
import { DataSource, DeepPartial } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"
import { BuyTileModule } from "./buy-tile.module"
import { BuyTileService } from "./buy-tile.service"
import { PlacedItemIsLimitException, UserInsufficientGoldException } from "@src/exceptions"

describe("BuyTileService", () => {
    let dataSource: DataSource
    let service: BuyTileService

    // Test users
    const users: Array<DeepPartial<UserEntity>> = [
        {
            username: "test_user_buy_tile_1",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 5000
        },
        {
            username: "test_user_buy_tile_2",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 100
        },
        {
            username: "test_user_buy_tile_3",
            chainKey: SupportedChainKey.Solana,
            accountAddress: "0x123456789abcdef",
            network: Network.Mainnet,
            tokens: 50.5,
            experiences: 10,
            energy: 5,
            level: 2,
            golds: 40000
        }
    ]

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
                BuyTileModule
            ],
            providers: [GoldBalanceService]
        }).compile()

        dataSource = module.get(DataSource)
        service = module.get(BuyTileService)
    })

    it("Should buy a tile successfully", async () => {
        const userBeforePurchase = await dataSource.manager.save(UserEntity, users[0])

        // Fetch a tile
        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: TileId.BasicTile1, availableInShop: true }
        })

        const buyTileRequest: BuyTileRequest = {
            tileId: tile.id,
            userId: userBeforePurchase.id,
            position: { x: 5, y: 10 }
        }

        // Buy tile
        const response: BuyTileResponse = await service.buyTile(buyTileRequest)

        // Verify user's gold was deducted
        const userAfterPurchase = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforePurchase.id }
        })

        expect(userAfterPurchase.golds).toBe(users[0].golds - tile.price)

        // Verify placed item was created
        const placedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: response.placedItemId, userId: userBeforePurchase.id }
        })

        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(buyTileRequest.position.x)
        expect(placedItem.y).toBe(buyTileRequest.position.y)
        expect(placedItem.placedItemTypeId).toBe(tile.id)
    })

    it("Should fail when user has insufficient gold", async () => {
        const userBeforePurchase = await dataSource.manager.save(UserEntity, users[1])

        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: TileId.BasicTile1, availableInShop: true }
        })

        const buyTileRequest: BuyTileRequest = {
            tileId: tile.id,
            userId: userBeforePurchase.id,
            position: { x: 5, y: 10 }
        }

        await expect(service.buyTile(buyTileRequest)).rejects.toThrow(
            new UserInsufficientGoldException(userBeforePurchase.golds, tile.price)
        )
    })

    it("Should fail when user tries to buy more tiles than the maximum ownership limit", async () => {
        const userBeforePurchase = await dataSource.manager.save(UserEntity, users[2])

        // Fetch a tile and its placed item type
        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: TileId.BasicTile1, availableInShop: true }
        })

        const placedItemType = await dataSource.manager.findOne(PlacedItemTypeEntity, {
            where: { type: PlacedItemType.Tile, tileId: tile.id }
        })

        // Create placed items to reach the limit
        const maxOwnership = tile.maxOwnership

        const placedItems = Array.from({ length: maxOwnership }).map(() => ({
            userId: userBeforePurchase.id,
            placedItemTypeId: placedItemType.id,
            x: 5,
            y: 5
        }))

        await dataSource.manager.save(PlacedItemEntity, placedItems)

        const buyTileRequest: BuyTileRequest = {
            tileId: tile.id,
            userId: userBeforePurchase.id,
            position: { x: 10, y: 20 }
        }

        await expect(service.buyTile(buyTileRequest)).rejects.toThrow(
            new PlacedItemIsLimitException(tile.id, maxOwnership)
        )
    })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, users)
    })
})
