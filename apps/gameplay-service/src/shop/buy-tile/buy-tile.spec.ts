import { ConfigModule } from "@nestjs/config"
import { Test } from "@nestjs/testing"
import { TypeOrmModule } from "@nestjs/typeorm"
import { envConfig, Network, SupportedChainKey } from "@src/config"
import { PlacedItemEntity, TileEntity, TileId, UserEntity } from "@src/database"
import { UserInsufficientGoldException } from "@src/exceptions"
import { GoldBalanceService } from "@src/services"
import { DataSource, DeepPartial } from "typeorm"
import { BuyTileRequest, BuyTileResponse } from "./buy-tile.dto"
import { BuyTileModule } from "./buy-tile.module"
import { BuyTileService } from "./buy-tile.service"

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
        }
        // {
        //     username: "test_user_buy_tile_3",
        //     chainKey: SupportedChainKey.Solana,
        //     accountAddress: "0x123456789abcdef",
        //     network: Network.Mainnet,
        //     tokens: 50.5,
        //     experiences: 10,
        //     energy: 5,
        //     level: 2,
        //     golds: 40000
        // }
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
        const userBeforeBuyTile = await dataSource.manager.save(UserEntity, users[0])

        const buyTileRequest: BuyTileRequest = {
            userId: userBeforeBuyTile.id,
            position: { x: 5, y: 10 }
        }

        // Buy tile
        const response: BuyTileResponse = await service.buyTile(buyTileRequest)

        // Verify user's gold was deducted
        const userAfterBuyTile = await dataSource.manager.findOne(UserEntity, {
            where: { id: userBeforeBuyTile.id }
        })

        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: TileId.BasicTile1 }
        })

        expect(userAfterBuyTile.golds).toBe(users[0].golds - tile.price)

        const placedItem = await dataSource.manager.findOne(PlacedItemEntity, {
            where: { id: response.placedItemId, userId: userBeforeBuyTile.id }
        })

        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(buyTileRequest.position.x)
        expect(placedItem.y).toBe(buyTileRequest.position.y)
        expect(placedItem.placedItemType.tileId).toBe(TileId.BasicTile1)
    })

    it("Should fail when user has insufficient gold", async () => {
        const userBeforeBuyTile = await dataSource.manager.save(UserEntity, users[1])

        const buyTileRequest: BuyTileRequest = {
            userId: userBeforeBuyTile.id,
            position: { x: 5, y: 10 }
        }

        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: TileId.BasicTile1 }
        })

        await expect(service.buyTile(buyTileRequest)).rejects.toThrow(
            new UserInsufficientGoldException(userBeforeBuyTile.golds, tile.price)
        )
    })

    // it("Should automatically switch to the next tile type after reaching max ownership", async () => {
    //     const userBeforeBuyTile = await dataSource.manager.save(UserEntity, users[2])

    //     const basicTile1 = await dataSource.manager.findOne(TileEntity, {
    //         where: { id: TileId.BasicTile1 }
    //     })

    //     const placedItemType1 = await dataSource.manager.findOne(PlacedItemTypeEntity, {
    //         where: { type: PlacedItemType.Tile, tileId: TileId.BasicTile1 }
    //     })

    //     const maxOwnershipTile1 = basicTile1.maxOwnership
    //     const placedItems1 = Array.from({ length: maxOwnershipTile1 }).map(() => ({
    //         userId: userBeforeBuyTile.id,
    //         placedItemTypeId: placedItemType1.id,
    //         x: 5,
    //         y: 5
    //     }))
    //     await dataSource.manager.save(PlacedItemEntity, placedItems1)

    //     const buyTileRequest: BuyTileRequest = {
    //         userId: userBeforeBuyTile.id,
    //         position: { x: 10, y: 20 }
    //     }

    //     const response: BuyTileResponse = await service.buyTile(buyTileRequest)

    //     const placedItem = await dataSource.manager.findOne(PlacedItemEntity, {
    //         where: { id: response.placedItemId, userId: userBeforeBuyTile.id },
    //         relations: {
    //             placedItemType: {
    //                 tile: true
    //             }
    //         }
    //     })

    //     const userAfterBuyTile = await dataSource.manager.findOne(UserEntity, {
    //         where: { id: userBeforeBuyTile.id }
    //     })

    //     expect(userAfterBuyTile.golds).toBe(
    //         userBeforeBuyTile.golds - placedItem.placedItemType.tile.price
    //     )
    //     expect(placedItem.placedItemType.tileId).toBe(TileId.BasicTile2)
    // })

    afterAll(async () => {
        await dataSource.manager.remove(UserEntity, users)
    })
})
