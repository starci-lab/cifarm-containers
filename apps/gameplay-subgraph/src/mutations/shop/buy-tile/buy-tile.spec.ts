// npx jest apps/gameplay-service/src/shop/buy-tile/buy-tile.spec.ts

import { Test } from "@nestjs/testing"
import { createObjectId } from "@src/common"
import { getMongooseToken, PlacedItemSchema, TileId, TileSchema, UserSchema } from "@src/databases"
import { GameplayConnectionService, GameplayMockUserService, TestingInfraModule } from "@src/testing"
import { Connection } from "mongoose"
import { BuyTileService } from "./buy-tile.service"

describe("BuyTileService", () => {
    let connection: Connection
    let service: BuyTileService
    let gameplayConnectionService: GameplayConnectionService
    let gameplayMockUserService: GameplayMockUserService

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [TestingInfraModule.register()],
            providers: [BuyTileService]
        }).compile()

        connection = moduleRef.get(getMongooseToken())
        service = moduleRef.get(BuyTileService)
        gameplayConnectionService = moduleRef.get(GameplayConnectionService)
        gameplayMockUserService = moduleRef.get(GameplayMockUserService)
    })

    it("should successfully buy a tile and update user and placed item", async () => {
        const x = 100, y = 100
        
        const tile = await connection.model<TileSchema>(TileSchema.name).findById(createObjectId(TileId.BasicTile))
        const user = await gameplayMockUserService.generate({ golds: tile.price + 10 })
        const totalCost = tile.price
        const golds = user.golds

        await service.buyTile({
            userId: user.id,
            tileId: TileId.BasicTile,
            position: { x, y }
        })

        const updatedUser = await connection.model<UserSchema>(UserSchema.name).findById(user.id)
        expect(golds - updatedUser.golds).toBe(totalCost)

        const placedItem = await connection.model<PlacedItemSchema>(PlacedItemSchema.name).findOne({
            x, y
        })
        console.log(placedItem,"ds")
        expect(placedItem).toBeDefined()
        expect(placedItem.x).toBe(x)
        expect(placedItem.y).toBe(y)
    })

    afterAll(async () => {
        await gameplayMockUserService.clear()
        await gameplayConnectionService.closeAll()
        await connection.close()
    })
})
