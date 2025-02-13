// npx jest apps/gameplay-service/src/shop/buy-tile/buy-tile.spec.ts

import { Test } from "@nestjs/testing"
import { DataSource } from "typeorm"
import { BuyTileService } from "./buy-tile.service"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import {
    TileEntity,
    TileId,
    getPostgreSqlToken,
    PlacedItemSchema,
    PlacedItemTypeEntity,
    UserSchema,
    PlacedItemType
} from "@src/databases"
import { GrpcNotFoundException } from "nestjs-grpc-exceptions"
import { GrpcFailedPreconditionException } from "@src/common"

describe("BuyTileService", () => {
    let dataSource: DataSource
    let service: BuyTileService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyTileService]
        }).compile()

        dataSource = moduleRef.get(getPostgreSqlToken())
        service = moduleRef.get(BuyTileService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy a tile and update user and placed item", async () => {
        const x = 0, y = 0

        const tileId = TileId.BasicTile1
        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: tileId }
        })
        const user = await gameplayMockUserService.generate({ golds: tile.price + 10 })

        const totalCost = tile.price
        const golds = user.golds

        // Create placed item
        await service.buyTile({
            userId: user.id,
            tileId,
            position: { x: 0, y: 0 }
        })

        const { golds: goldsAfter } = await dataSource.manager.findOne(UserSchema, {
            where: { id: user.id },
            select: ["golds"]
        })

        expect(golds - goldsAfter).toBe(totalCost)

        const placedItem = await dataSource.manager.findOne(PlacedItemSchema, {
            where: {
                userId: user.id,
                placedItemType: {
                    tile: { id: tileId }
                }
            }
        })

        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(x)
        expect(placedItem.y).toBe(y)
    })

    it("should throw GrpcNotFoundException when tile is not found", async () => {
        const user = await gameplayMockUserService.generate()
        const invalidTileId = "invalid_tile_id" as TileId

        await expect(
            service.buyTile({
                userId: user.id,
                tileId: invalidTileId,
                position: { x: 0, y: 0 }
            })
        ).rejects.toThrow(GrpcNotFoundException)
    })

    it("should throw GrpcFailedPreconditionException when max ownership of tile is reached", async () => {
        const tileId = TileId.BasicTile1
        const tile = await dataSource.manager.findOne(TileEntity, {
            where: { id: tileId }
        })

        const user = await gameplayMockUserService.generate({ golds: tile.price + 10 })

        // Create placed item tile and save placed item, util max ownership achieved

        const placedItemType = await dataSource.manager.findOne(PlacedItemTypeEntity, {
            where: { type: PlacedItemType.Tile, tileId },
            select: ["id"]
        })
        await dataSource.manager.save(
            PlacedItemSchema,
            Array.from({ length: tile.maxOwnership }, (_, i) => ({
                userId: user.id,
                x: i,
                y: 0,
                placedItemTypeId: placedItemType.id
            }))
        )

        // Simulate max ownership
        await expect(
            service.buyTile({
                userId: user.id,
                tileId,
                position: { x: 1, y: 0 }
            })
        ).rejects.toThrow(GrpcFailedPreconditionException)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
    })
})
